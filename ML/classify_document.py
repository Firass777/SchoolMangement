import os
import sys
import joblib
import numpy as np
import PyPDF2
import mysql.connector
from datetime import datetime
import json
import re
from pdfminer.high_level import extract_text as pdfminer_extract
import pytesseract


# Configure paths
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'document_classifier.pkl')

def get_absolute_path(stored_path):
    """Convert stored path to absolute system path"""
    base_path = os.path.join(os.path.dirname(__file__), '..', 'storage', 'app', 'public')
    full_path = os.path.normpath(os.path.join(base_path, stored_path))
    if sys.platform == 'win32':
        full_path = full_path.replace('/', '\\')
    return full_path

def check_poppler_installed():
    """Check if poppler is available in PATH"""
    if sys.platform == 'win32':
        try:
            from subprocess import run, PIPE
            result = run(['pdftoppm', '-v'], stdout=PIPE, stderr=PIPE)
            return result.returncode == 0
        except:
            return False
    return True  

POPPLER_AVAILABLE = check_poppler_installed()

def extract_text(file_path):
    """Robust text extraction with multiple fallback methods"""
    abs_path = get_absolute_path(file_path)
    print(f"Attempting to extract text from: {abs_path}")
    
    extraction_methods = [
        ('PyPDF2', lambda: extract_with_pypdf2(abs_path)),
        ('pdfminer', lambda: extract_with_pdfminer(abs_path))
    ]
    
    # Only add OCR if poppler is available
    if POPPLER_AVAILABLE:
        extraction_methods.append(('OCR', lambda: extract_with_ocr(abs_path)))
    
    for method_name, method_func in extraction_methods:
        try:
            text = method_func()
            if text and text.strip():
                print(f"Successfully extracted with {method_name}")
                return text.lower()
        except Exception as e:
            print(f"{method_name} extraction failed: {str(e)}")
            continue
    
    print("All extraction methods failed")
    return None

def extract_with_pypdf2(file_path):
    """Text extraction using PyPDF2"""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        return ' '.join([page.extract_text() or '' for page in reader.pages])

def extract_with_pdfminer(file_path):
    """Text extraction using pdfminer"""
    return pdfminer_extract(file_path)

def extract_with_ocr(file_path):
    """Text extraction using OCR (fallback)"""
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(file_path, dpi=300, grayscale=True)
        return ' '.join([pytesseract.image_to_string(img) for img in images])
    except Exception as e:
        if "poppler" in str(e).lower():
            print("Poppler not found in PATH despite detection")
        raise

def preprocess_text(text):
    """Enhanced text preprocessing focusing on financial terms"""
    if not text:
        return ""
    
    text = text.lower()
    
    # Boost financial signals
    financial_terms = ['payment', 'receipt', 'invoice', 'amount', 'paid', 
                      'balance', 'due', 'refund', 'transaction', 'fee',
                      'tuition', 'bank', 'credit', 'debit', 'card', 'cash',
                      'dollar', 'total', 'fund', 'account']
    
    # Add weight to financial terms
    for term in financial_terms:
        if term in text:
            text += f" {term}_financial_term "
    
    # Highlight dollar amounts
    text = re.sub(r'(\$\d+\.?\d*)', r'\1 dollar_amount ', text)
    
    return text

def classify_document(document_id):
    """Classify document with robust error handling"""
    result = {
        'document_id': document_id, 
        'success': False,
        'error': None,
        'category': None,
        'confidence': 0.0
    }
    
    try:
        document_id = int(document_id)
    except (ValueError, TypeError):
        result['error'] = "Invalid document ID"
        return json.dumps(result)
    
    conn = None
    try:
        # Database connection
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="pfe2",
            connection_timeout=5
        )
        cursor = conn.cursor(dictionary=True)
        
        # Get document
        cursor.execute("SELECT id, file_name, file_path FROM documents WHERE id = %s", (document_id,))
        document = cursor.fetchone()
        
        if not document or not document.get('file_path'):
            result['error'] = "Document not found or invalid"
            return json.dumps(result)

        # Extract and preprocess text
        raw_text = extract_text(document['file_path'])
        if not raw_text:
            result['error'] = "No text could be extracted from document"
            if not POPPLER_AVAILABLE:
                result['suggestion'] = {
                    'ocr_required': True,
                    'instructions': "Install: (1) Tesseract OCR, (2) Add poppler to PATH"
                }
            return json.dumps(result)
            
        processed_text = preprocess_text(raw_text)
        
        # Load model with validation
        if not os.path.exists(MODEL_PATH):
            result['error'] = "Model file not found"
            return json.dumps(result)
            
        model_data = joblib.load(MODEL_PATH)
        if len(model_data) != 2:
            result['error'] = "Invalid model format"
            return json.dumps(result)
            
        vectorizer, model = model_data
        
        # Validate model components
        if not hasattr(model, 'predict_proba') or not hasattr(model, 'classes_'):
            result['error'] = "Model missing required methods"
            return json.dumps(result)
            
        # Transform and predict
        X = vectorizer.transform([processed_text])
        proba = model.predict_proba(X)
        
        if proba is None or len(proba) == 0:
            result['error'] = "Prediction failed"
            return json.dumps(result)
            
        proba = proba[0]  # Get first prediction
        
        # Get best prediction
        max_idx = np.argmax(proba)
        confidence = float(proba[max_idx])
        category = str(model.classes_[max_idx])
        
        # Financial document heuristic
        if ('$' in raw_text or any(term in raw_text for term in ['payment', 'receipt', 'invoice'])):
            if category != 'Financial':
                category = 'Financial'
                confidence = max(confidence, 0.8)
            else:
                confidence = min(confidence + 0.1, 1.0)  

        # Confidence threshold
        if confidence < 0.5:
            category = "Uncertain"
            confidence = 0.0

        # Database update
        cursor.execute("""
            INSERT INTO document_predictions 
            (document_id, file_name, predicted_category, confidence_score, processed_at)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                predicted_category = VALUES(predicted_category),
                confidence_score = VALUES(confidence_score),
                processed_at = VALUES(processed_at)
        """, (
            document_id,
            document.get('file_name', ''),
            category,
            confidence,
            datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        ))
        
        conn.commit()
        
        # Successful result
        result.update({
            'success': True,
            'category': category,
            'confidence': confidence,
            'message': f"Classified as: {category} ({confidence:.1%} confidence)"
        })
        
    except Exception as e:
        result['error'] = f"Processing error: {str(e)}"
        if conn:
            conn.rollback()
    finally:
        if conn and conn.is_connected():
            conn.close()

    return json.dumps(result, ensure_ascii=False)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(classify_document(sys.argv[1]))
    else:
        print(json.dumps({
            'success': False,
            'error': "Missing document ID",
            'usage': "python classify_document.py <document_id>"
        }, ensure_ascii=False))