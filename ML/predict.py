import joblib
import mysql.connector
import pandas as pd
import sys
import json
import os
import traceback


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'performance_model.pkl')

GRADE_MAP = {'A': 90, 'B': 80, 'C': 70, 'D': 60, 'F': 50}

def get_student_data(nin):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="pfe2"
        )
        grades_query = "SELECT grade FROM grades WHERE student_nin = %s"
        grades_df = pd.read_sql(grades_query, conn, params=(nin,))
        
        if grades_df.empty:
            return None, None
        
        grades_df['grade'] = grades_df['grade'].map(GRADE_MAP)
        avg_grade = grades_df['grade'].mean()
        
        attendance_query = "SELECT status FROM attendances WHERE student_nin = %s"
        attendance_df = pd.read_sql(attendance_query, conn, params=(nin,))
        conn.close()
        
        attendance_rate = (attendance_df['status'] == 'Present').mean() if not attendance_df.empty else 0.0
        return avg_grade, attendance_rate
    
    except Exception as e:
        print(f"Error fetching data: {str(e)}", file=sys.stderr)
        sys.exit(1)

def predict_performance(nin):
    avg_grade, attendance_rate = get_student_data(nin)
    
    if avg_grade is None:
        return json.dumps({"error": "Insufficient data"})
    
    if attendance_rate < 0.5:
        return json.dumps({"prediction": "Risk of Failing (Low Attendance)"})
    
    try:
        input_data = pd.DataFrame([[avg_grade, attendance_rate]], 
        columns=['average_grade', 'attendance_rate'])
        model = joblib.load(MODEL_PATH)  
        prediction = model.predict(input_data)
        result = "Likely to Pass" if prediction[0] == 1 else "Risk of Failing"
        return json.dumps({"prediction": result})
    except Exception as e:
        print(f"Prediction error: {str(e)}", file=sys.stderr)
        return json.dumps({"error": "Model prediction failed"})

if __name__ == "__main__":
    try:
        if len(sys.argv) != 2:
            print(json.dumps({"error": "Invalid arguments"}))
            sys.exit(1)
            
        nin = sys.argv[1]
        result = predict_performance(nin)
        print(result)
        
    except Exception as e:
        # Log full error to stderr
        traceback.print_exc(file=sys.stderr)
        # Output clean JSON
        print(json.dumps({"error": "Internal script error"}))
        sys.exit(1)