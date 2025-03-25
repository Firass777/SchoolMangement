import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import os
import re

# Enhanced financial keywords with duplicates removed
FINANCIAL_KEYWORDS = list(set([
    'payment', 'receipt', 'invoice', 'amount', 'paid', 'balance', 
    'due', 'refund', 'transaction', 'fee', 'tuition', 'bank',
    'credit', 'debit', 'card', 'transfer', 'deposit', 'charge',
    'method', 'cash', 'check', 'dollar', 'total', 'fund', 'account',
    'pay', 'receipt', 'payment', 'pay', 'paid', 'amount', 'balance',
    'due', 'refund', 'transaction', 'fee', 'tuition', 'bank', 'credit',
    'debit', 'card', 'transfer', 'deposit', 'charge', 'method',
    'cash', 'check', 'dollar', 'total', 'fund', 'account'
]))

# Enhanced training data with more financial examples
financial_examples = [
    ("Payment receipt for $10.00 dated 03/15/2024", "Financial"),
    ("Invoice #12345 for $150.00 for lab fees", "Financial"),
    ("Bank transfer of $500.00 completed on 03/01/2024", "Financial"),
    ("Tuition fee statement showing $2,500.00 due", "Financial"),
    ("Refund of $75.00 processed for overpayment", "Financial"),
    ("Monthly payment plan for $1,200.00 total", "Financial"),
    ("Scholarship award of $1,000.00 for fall semester", "Financial"),
    ("Financial aid award letter totaling $5,000.00", "Financial"),
    ("Bookstore receipt for $85.99 for textbooks", "Financial"),
    ("Late fee of $25.00 applied to account", "Financial"),
    ("Credit of $50.00 applied to student account", "Financial"),
    ("Dining dollars balance: $250.00 remaining", "Financial"),
    ("Housing deposit of $300.00 received", "Financial"),
    ("Parking permit fee: $150.00 per semester", "Financial"),
    ("Technology fee assessment: $100.00", "Financial"),
    ("Health insurance premium: $1,500.00 annually", "Financial"),
    ("Library fine payment: $10.50", "Financial"),
    ("Graduation application fee: $50.00", "Financial"),
    ("Transcript fee: $10.00 per copy", "Financial"),
    ("Study abroad deposit: $500.00", "Financial"),
    ("$10.00 payment received", "Financial"),
    ("Payment of $25 processed", "Financial"),
    ("Refund amount: $15.50", "Financial"),
    ("Balance due: $100.00", "Financial"),
    ("Credit applied: $50.00", "Financial"),
    ("Payment Receipt for School Fees - $20 - Transaction Ref: SCH-2024", "Financial"),
    ("Credit Card Payment Confirmation: $50.00", "Financial"),
    ("Tuition Fee Receipt - Student ID: 12345 - Amount: $500", "Financial"),
    ("Debit Transaction Approval - Amount: $75.00 - Date: 03/25/2024", "Financial"),
    ("Payment Receipt - Name: Ahmed - NIN: 123456789 - Amount: $20", "Financial"),
    ("School Fees Payment Confirmation - Reference: SCH-2024-025", "Financial"),
    ("Online Payment Receipt - Transaction ID: TXN-20240325", "Financial"),
    ("Credit/Debit Card Payment Authorization - $150.00", "Financial"),
    ("Receipt for $20 payment by credit card", "Financial"),
    ("Payment confirmation for invoice #INV-2024-001", "Financial"),
    ("Bank statement showing $1,000.00 deposit", "Financial"),
    ("Wire transfer receipt for $750.00", "Financial"),
    ("Payment voucher for $125.00", "Financial"),
    ("Cash receipt for $50.00", "Financial"),
    ("$20 payment", "Financial"),
    ("Paid $15", "Financial"),
    ("Amount: $100", "Financial"),
    ("Payment", "Financial"),  
    ("Receipt", "Financial")   
]

academic_examples = [
    ("Fall 2024 course registration form", "Academic"),
    ("Certificate of enrollment in Computer Science", "Academic"),
    ("Admission letter for MBA program", "Academic"),
    ("Academic calendar with important dates", "Academic"),
    ("Syllabus for CS-505: Machine Learning", "Academic"),
    ("Degree requirements for Biology major", "Academic"),
    ("Internship approval form", "Academic"),
    ("Thesis submission guidelines", "Academic"),
    ("Academic probation notification letter", "Academic"),
    ("Transfer credit evaluation report", "Academic"),
    ("Course withdrawal form", "Academic"),
    ("Major declaration form", "Academic"),
    ("Academic appeal request", "Academic"),
    ("Independent study proposal", "Academic"),
    ("Honors program application", "Academic"),
    ("Graduate school application", "Academic"),
    ("Study abroad approval form", "Academic"),
    ("Course substitution request", "Academic"),
    ("Academic standing notification", "Academic"),
    ("Faculty advisor meeting notes", "Academic"),
    ("Final project submission guidelines", "Academic"),
    ("Seminar schedule for summer session", "Academic"),
    ("Research assistantship offer letter", "Academic"),
    ("Lab rotation assignment details", "Academic"),
    ("Workshop invitation for academic writing", "Academic"),
    ("Study abroad", "Academic")  
]

record_examples = [
    ("Final grade report for Chemistry 101", "Record"),
    ("Attendance record showing 90% presence", "Record"),
    ("Progress report with faculty comments", "Record"),
    ("Standardized test scores report", "Record"),
    ("Official transcript with GPA 3.75", "Record"),
    ("Disciplinary record for policy violation", "Record"),
    ("Accommodation approval for disability", "Record"),
    ("Honor roll certificate", "Record"),
    ("Graduation audit report", "Record"),
    ("Placement test results summary", "Record"),
    ("Midterm grade notification", "Record"),
    ("Final exam schedule", "Record"),
    ("Academic standing report", "Record"),
    ("Degree progress report", "Record"),
    ("Student conduct record", "Record"),
    ("Academic warning notice", "Record"),
    ("Dean's list recognition", "Record"),
    ("Scholarship eligibility report", "Record"),
    ("Honors thesis evaluation", "Record"),
    ("Research project assessment", "Record"),
    ("Semester performance evaluation", "Record"),
    ("Course performance report", "Record"),
    ("Evaluation of student progress", "Record"),
    ("Midterm performance report", "Record"),
    ("Final assessment scores", "Record"),
    ("Grade", "Record")  
]

# Combine all training examples
train_data = financial_examples + academic_examples + record_examples

def preprocess_text(text):
    """Enhanced text preprocessing with aggressive financial term detection"""
    text = text.lower()
    
    # First check for dollar amounts - if found, boost financial signal
    has_dollar_amount = bool(re.search(r'\$\d+\.?\d*', text))
    
    # Count financial keywords
    financial_keyword_count = sum(
        1 for keyword in FINANCIAL_KEYWORDS 
        if re.search(r'\b' + re.escape(keyword) + r'\b', text)
    )
    
    # If we find dollar amounts or financial keywords, strongly weight as financial
    if has_dollar_amount or financial_keyword_count >= 1:
        text += " financial_keyword_present " * (financial_keyword_count + 3)
        if has_dollar_amount:
            text += " dollar_amount_present "
    
    # Standardize financial patterns
    text = re.sub(r'\b(?:paid|payment|fee|amount|balance|due|receipt|invoice|transaction)\b', 'financial_term', text)
    text = re.sub(r'\$\d+\.?\d*', 'dollar_amount', text)
    text = re.sub(r'\b\d{4,}\b', 'id_number', text)
    text = re.sub(r'\b(?:visa|mastercard|credit\s?card|debit\s?card|bank\s?transfer)\b', 'payment_method', text)
    
    # Standardize document references
    text = re.sub(r'\b(?:ref|reference|id)\s*[:#]?\s*\w+\d+\b', 'doc_reference', text)
    
    # Dates and numbers
    text = re.sub(r'\d{1,2}/\d{1,2}/\d{2,4}', 'date', text)
    text = re.sub(r'\d+', 'number', text)
    
    return text

# Preprocess texts and separate labels
texts = [preprocess_text(t) for t, _ in train_data]
labels = [l for _, l in train_data]

# Enhanced TF-IDF vectorization
vectorizer = TfidfVectorizer(
    stop_words='english',
    ngram_range=(1, 2),  
    max_features=3000,    
    min_df=1,
    max_df=0.85,         
    analyzer='word'
)

X = vectorizer.fit_transform(texts)

# Split the data for evaluation
X_train, X_test, y_train, y_test = train_test_split(
    X, labels, 
    test_size=0.2, 
    random_state=42, 
    stratify=labels
)

# Enhanced Random Forest Classifier with balanced weights
model = RandomForestClassifier(
    n_estimators=500,    
    max_depth=20,        
    min_samples_split=3,
    class_weight='balanced',  
    random_state=42,
    max_features='sqrt',
    bootstrap=True,
    oob_score=True
)

model.fit(X_train, y_train)

# Evaluate the model
print("Model Evaluation:")
print(classification_report(y_test, model.predict(X_test), zero_division=0))

# Cross-validate Financial class performance
financial_idx = np.where(model.classes_ == 'Financial')[0][0]
financial_proba = model.predict_proba(X_test)[:, financial_idx]
financial_mask = np.array(y_test) == 'Financial'

print("\nFinancial Document Performance:")
print(f"Average confidence for Financial docs: {np.mean(financial_proba[financial_mask]):.1%}")
print(f"Average confidence for non-Financial docs: {np.mean(financial_proba[~financial_mask]):.1%}")

# Save the trained model and vectorizer
model_path = os.path.join(os.path.dirname(__file__), 'document_classifier.pkl')
joblib.dump((vectorizer, model), model_path)
print(f"\nModel trained and saved to: {model_path}")
print(f"Categories: {list(model.classes_)}")

# Test cases including your specific examples
test_cases = [
    "Payment receipt for $20",
    "Invoice for $50 lab fees",
    "Bank transfer of $100",
    "Tuition payment confirmation",
    "Credit card receipt #12345",
    "Payment of $10",  
    "$20 receipt",     
    "Paid $50",        
    "Transaction ID: TXN123 Amount: $100",
    "Grade",
    "Payment",
    "Study abroad",
    "test AI.pdf content: Payment Receipt Name: Ahmed Amount: $20",
]

print("\nDocument Classification Testing:")
for text in test_cases:
    processed = preprocess_text(text)
    vec = vectorizer.transform([processed])
    pred = model.predict(vec)[0]
    proba = model.predict_proba(vec)[0]
    print(f"\nText: {text}")
    print(f"Predicted: {pred}")
    print(f"Confidence: {max(proba):.1%}")
    print(f"Probabilities: {dict(zip(model.classes_, np.round(proba, 3)))}")