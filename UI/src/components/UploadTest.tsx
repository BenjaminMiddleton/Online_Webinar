import React, { useState } from 'react';
import ButtonNavBar from './ButtonNavBar';
import MinutesContentBox from './MinutesContentBox'; // Add this import
import { MinutesData } from '../api/apiService';
import './UploadTest.css';

const UploadTest: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingResults, setProcessingResults] = useState<MinutesData | null>(null);
  const [testStatus, setTestStatus] = useState<string>('idle');
  const [processingError, setProcessingError] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setTestStatus('file-selected');
    setProcessingError(null);
    console.log('File selected:', file?.name);
  };

  const handleProcessingComplete = (minutes: MinutesData) => {
    // Ensure all required fields are present
    const completeMinutes: MinutesData = {
      title: minutes.title || '',
      duration: minutes.duration || '00:00',
      summary: minutes.summary || '',
      action_points: Array.isArray(minutes.action_points) ? minutes.action_points : [],
      transcription: minutes.transcription || '',
      job_id: minutes.job_id || '', // now valid per updated MinutesData
      speakers: Array.isArray(minutes.speakers) ? minutes.speakers : [],
      pdf_path: minutes.pdf_path || '',
    };
    
    setProcessingResults(completeMinutes);
    setTestStatus('processing-complete');
    console.log('Processing complete with data:', completeMinutes);
    
    // Check for empty results and set appropriate message
    if (!completeMinutes.summary && completeMinutes.transcription) {
      setProcessingError('API processing issue: Summary could not be generated. The transcript is available.');
    }
  };

  const handleProcessingError = (error: string) => {
    setProcessingError(error);
    setTestStatus('processing-error');
    console.error('Processing error:', error);
  };

  return (
    <div className="upload-test-container">
      <h1>File Upload Test</h1>
      
      <div className="test-section">
        <h2>Upload Component</h2>
        <p>Click the button below to select and upload an audio file:</p>
        
        <div className="button-container">
          <ButtonNavBar 
            type="files" 
            label="Upload Audio"
            onFileSelect={handleFileSelect}
            onProcessingComplete={handleProcessingComplete}
            onProcessingError={handleProcessingError}
          />
        </div>

        <div className="status-panel">
          <h3>Status</h3>
          <p>Current state: <strong>{testStatus}</strong></p>
          
          {selectedFile && (
            <div className="file-info">
              <h4>Selected File</h4>
              <ul>
                <li>Name: {selectedFile.name}</li>
                <li>Size: {Math.round(selectedFile.size / 1024)} KB</li>
                <li>Type: {selectedFile.type || 'unknown'}</li>
              </ul>
            </div>
          )}
          
          {processingError && (
            <div className="error-message">
              <h4>Processing Alert</h4>
              <p>{processingError}</p>
            </div>
          )}
        </div>

        {processingResults && (
          <div className="results-panel">
            <h3>Processing Results</h3>
            
            <div className="result-section">
              <h4>Meeting Title</h4>
              <p>{processingResults.title || 'No title provided'}</p>
            </div>
            
            <div className="result-section">
              <h4>Summary</h4>
              <p>{processingResults.summary || 'No summary generated'}</p>
              {!processingResults.summary && (
                <p className="processing-note">
                  <i>Note: Summary generation was not successful. Please refer to the transcript for meeting content.</i>
                </p>
              )}
            </div>
            
            {processingResults.action_points && processingResults.action_points.length > 0 ? (
              <div className="result-section">
                <h4>Action Points</h4>
                <ul>
                  {processingResults.action_points.map((point: string, index: number) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="result-section">
                <h4>Action Points</h4>
                <p><i>No action points were identified</i></p>
              </div>
            )}
            
            {processingResults.transcription && (
              <div className="result-section">
                <h4>Transcript</h4>
                <div className="transcript-container">
                  <pre>{processingResults.transcription}</pre>
                </div>
              </div>
            )}
            
            {processingResults.pdf_path && (
              <div className="result-section">
                <h4>Generated Document</h4>
                <a 
                  href={`http://localhost:5000${processingResults.pdf_path.replace(/^.*\/pdf/, '/pdf')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View Generated Document
                </a>
              </div>
            )}

            {processingResults.action_points && processingResults.action_points.length > 0 && (
              <div className="result-section">
                <h4>Action Points (Direct Display)</h4>
                <ul>
                  {processingResults.action_points.map((point: string, index: number) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Add the MinutesContentBox component with jobId */}
            <div className="result-section">
              <h4>Action Points (MinutesContentBox Component)</h4>
              <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                <MinutesContentBox 
                  jobId={processingResults?.job_id} // now valid as job_id exists in MinutesData
                  showActionPoints={true}
                  showSummary={false}
                  showTranscript={false}
                  showMinutesContentBox={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadTest;
