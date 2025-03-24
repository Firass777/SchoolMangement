import mysql.connector
import pandas as pd

# Map letter grades to numerical values
GRADE_MAP = {
    'A': 90,
    'B': 80,
    'C': 70,
    'D': 60,
    'F': 50
}

def get_student_data():
    # Connect to XAMPP MySQL database
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="pfe2" 
    )
    
    # Get grades and attendance data
    query = """
    SELECT g.student_nin, 
           g.grade,
           a.status
    FROM grades g
    LEFT JOIN attendances a ON g.student_nin = a.student_nin
    """
    
    df = pd.read_sql(query, conn)
    conn.close()
    
    # Convert letter grades to numerical values
    df['grade'] = df['grade'].map(GRADE_MAP)
    
    # Calculate average grade and attendance rate per student
    result = df.groupby('student_nin').agg(
        average_grade=('grade', 'mean'), 
        attendance_rate=('status', lambda x: (x == 'Present').mean())
    ).reset_index()
    
    # Create target variable (Pass/Fail based on average grade >= 70)
    result['pass'] = (result['average_grade'] >= 70).astype(int)
    
    return result[['average_grade', 'attendance_rate', 'pass']]