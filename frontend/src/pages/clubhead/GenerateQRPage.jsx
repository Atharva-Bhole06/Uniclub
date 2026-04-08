import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { PageHeader, FormInput, Button } from '../../components/UI';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';

export default function GenerateQRPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customFields, setCustomFields] = useState([]);
  const [newField, setNewField] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddField = () => {
    if (newField.trim() && !customFields.some(f => f.question === newField.trim())) {
      setCustomFields([...customFields, { question: newField.trim(), required: isRequired }]);
      setNewField('');
      setIsRequired(false);
    }
  };

  const handleRemoveField = (fieldQuestion) => {
    setCustomFields(customFields.filter(f => f.question !== fieldQuestion));
  };

  const generateQR = async () => {
    setLoading(true);
    setError('');
    try {
      // Serialize objects as JSON strings so backend can save them simply in List<String>
      const serializedFields = customFields.map(f => JSON.stringify(f));
      const res = await api.post(`/attendance/generate/${id}`, {
        customFields: serializedFields
      });
      setSessionData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate QR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Generate Attendance QR" subtitle="Create a time-limited form for students to log attendance" />

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Form Builder Section */}
        <div style={{ flex: '1 1 400px', background: 'var(--surface)', padding: '2rem', borderRadius: '12px' }}>
          <h3>Form Builder</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Default fields (Name, Email, Moodle ID, Department, Year, Roll No, Division) will be requested.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <strong>Custom Fields (Optional)</strong>
            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem', alignItems: 'center' }}>
              <FormInput 
                placeholder="e.g. Feedback about speaker" 
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddField()}
                style={{ flex: 1 }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ccc', fontSize: '0.9rem', cursor: 'pointer' }}>
                 <input type="checkbox" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} />
                 Required
              </label>
              <Button onClick={handleAddField} type="button" variant="secondary">Add</Button>
            </div>
            
            <ul style={{ marginTop: '1rem', listStyle: 'none', padding: 0 }}>
              {customFields.map((field, idx) => (
                <li key={idx} style={{ background: 'var(--background)', padding: '10px', borderRadius: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span>{field.question}</span>
                    <span style={{ marginLeft: '10px', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: field.required ? 'var(--danger-main)' : '#444', color: '#fff' }}>
                      {field.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <button onClick={() => handleRemoveField(field.question)} style={{ background: 'none', border: 'none', color: 'var(--danger-main)', cursor: 'pointer' }}>Remove</button>
                </li>
              ))}
            </ul>
          </div>

          {!sessionData && (
             <Button variant="primary" onClick={generateQR} loading={loading} style={{ width: '100%' }}>
               Generate QR
             </Button>
          )}

          {error && <div style={{ color: 'var(--danger-main)', marginTop: '1rem' }}>{error}</div>}
        </div>

        {/* QR Code Display Section */}
        {sessionData && (
          <div style={{ flex: '1 1 300px', background: 'var(--surface)', padding: '2rem', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--success-main)' }}>QR Session Created!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              Valid until: {new Date(sessionData.expiresAt).toLocaleTimeString()}
            </p>
            
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
               <QRCodeSVG value={sessionData.id} size={200} />
            </div>

            <p style={{ fontSize: '0.8rem', color: '#888' }}>
               Session ID: {sessionData.id}
            </p>
            
            <Button variant="outline" onClick={() => navigate('/clubhead/events')} style={{ marginTop: '1rem' }}>
               Back to Events
            </Button>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
