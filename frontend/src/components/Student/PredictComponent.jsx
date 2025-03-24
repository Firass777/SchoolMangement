import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PerformancePredictor = () => {
    const [prediction, setPrediction] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Get user data from localStorage on component mount
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    const handlePredict = async () => {
        if (!user?.nin) {
            alert('Student NIN not found in user data');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/predict', {
                params: { nin: user.nin }
            });
            
            console.log('API Response:', response.data);  // Debug: Log the API response
            
            if (response.data.prediction) {
                setPrediction(response.data.prediction);
            } else {
                alert('No prediction data received');
            }
        } catch (error) {
            console.error('Prediction error:', error);
            alert('Error getting prediction');
        }
        setLoading(false);
    };

    return (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>Student Performance Predictor</h2>
            
            {user ? (
                <div>
                    <p>Predicting for: {user.name} (NIN: {user.nin})</p>
                    <button 
                        onClick={handlePredict} 
                        disabled={loading}
                        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        {loading ? 'Predicting...' : 'Get Prediction'}
                    </button>
                </div>
            ) : (
                <p>No user data found. Please log in.</p>
            )}
            
            {prediction && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                    <h3>Prediction Result:</h3>
                    <p>{prediction}</p>
                </div>
            )}
        </div>
    );
};

export default PerformancePredictor;