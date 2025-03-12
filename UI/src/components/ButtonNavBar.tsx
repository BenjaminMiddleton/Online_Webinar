import React, { useRef, useState, useEffect } from 'react';
import './ButtonNavBar.css';
import io from 'socket.io-client';

// Define the MinutesData interface if it's not imported
export interface MinutesData {
  title: string;
  duration: string;
  summary: string;
  action_points: string[];
  transcription: string;
  speakers: string[];
  pdf_path?: string;
}

interface ButtonNavBarProps {
  type: 'arrow' | 'upload' | 'files';
  onClick?: () => void;
  label?: string;
  onFileSelect?: (file: File | null) => void;
  onProcessingComplete?: (minutes: MinutesData) => void;
  onProcessingError?: (error: string) => void;
  onNewJobCreated?: (jobId: string, jobData?: any) => void;
}

// Arrow Icon component
const ArrowIcon: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.8159 36.5L7 20L23.8159 3.5L27 6.50779L13.2495 20L27 33.4922L23.8159 36.5Z" fill="#F8F8F8" />
  </svg>
);

// Upload Icon component
const UploadIcon: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.9475 9.0252V24.125H22.0525V9.02521L28.2746 15.5301L31.173 12.5L20 0.819161L8.82702 12.5L11.7254 15.5301L17.9475 9.0252Z" fill="#F8F8F8" />
    <path d="M20 0.638672L19.8203 0.828125L8.82031 12.3281L8.6543 12.5L8.82031 12.6719L11.5449 15.5215L11.7246 15.7109L11.9062 15.5215L11.6348 15.4434H11.8164L11.7246 15.3496L9 12.5L20 1L31 12.5L28.2754 15.3496L21.9277 8.71289V24H18.0723V8.71289L11.7246 15.3496L11.9062 15.5215L17.8223 9.33594V24.25H22.1777V9.33594L28.0938 15.5215L28.2754 15.7109L28.4551 15.5215L31.1797 12.6719L31.3457 12.5L31.1797 12.3281L20.1797 0.828125L20 0.638672Z" fill="#F8F8F8" />
    <path d="M4 26V28C4 29.6236 4.64686 31.182 5.79492 32.3301C6.943 33.4781 8.50136 34.125 10.125 34.125H30.125C31.7487 34.125 33.307 33.4782 34.4551 32.3301C35.6025 31.1821 36.25 29.623 36.25 28V26H32V28C32 28.4981 31.8034 28.974 31.4512 29.3262C31.099 29.6783 30.6231 29.875 30.125 29.875H10.125C9.6269 29.875 9.15105 29.6784 8.79883 29.3262C8.44661 28.974 8.25 28.4981 8.25 28V26H4Z" fill="#F8F8F8" />
  </svg>
);

// Files Icon component with proper interface
interface FilesIconProps {
  onFileSelect?: (file: File | null) => void;
  onClick?: () => void;
  onProcessingComplete?: (minutes: MinutesData) => void;
  onProcessingError?: (error: string) => void;
  onNewJobCreated?: (jobId: string, jobData?: any) => void;
}

const FilesIcon: React.FC<FilesIconProps> = ({
  onFileSelect,
  onClick,
  onProcessingComplete,
  onProcessingError,
  onNewJobCreated
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    // Set up connection event handlers
    socketRef.current.on('connect', () => {
      console.log('Socket.IO connected with ID:', socketRef.current.id);
      setError(null);
    });

    socketRef.current.on('connect_error', (err: any) => {
      console.error('Socket.IO connection error:', err);
      setError('Connection error: Unable to reach the server');
    });

    socketRef.current.on('disconnect', (reason: string) => {
      console.log('Socket.IO disconnected:', reason);
      if (reason === 'io server disconnect') {
        socketRef.current.connect();
      }
    });

    // Set up processing event handlers
    socketRef.current.on('processing_update', (data: any) => {
      console.log('Processing update:', data);
      if (data.job_id === jobId) {
        setProcessingStatus(data.status);
      }
    });

    socketRef.current.on('processing_complete', (data: any) => {
      console.log('Processing complete:', data);
      
      if (!data || typeof data !== 'object') {
        console.error('Invalid data received from server');
        return;
      }
      
      if (data.job_id === jobId) {
        setProcessingStatus('completed');
        setUploading(false);
        
        // Store job data in localStorage for persistence
        if (data.job_id) {
          localStorage.setItem('lastJobId', data.job_id);
          try {
            localStorage.setItem('lastJobData', JSON.stringify(data));
          } catch (e) {
            console.error('Error storing job data in localStorage:', e);
          }
        }
        
        // Call onNewJobCreated callback
        if (onNewJobCreated && data.job_id) {
          onNewJobCreated(data.job_id, data);
        }
        
        // Validate minutes data before passing to callback
        if (onProcessingComplete && data.minutes) {
          try {
            const validatedMinutes: MinutesData = {
              title: data.minutes.title || '',
              duration: data.minutes.duration || '00:00',
              summary: data.minutes.summary || '',
              action_points: Array.isArray(data.minutes.action_points) ? data.minutes.action_points : [],
              transcription: data.minutes.transcription || '',
              speakers: Array.isArray(data.minutes.speakers) ? data.minutes.speakers : [],
              pdf_path: data.pdf_path || data.minutes.pdf_path || '',
            };
            
            onProcessingComplete(validatedMinutes);
          } catch (e) {
            console.error('Error processing minutes data:', e);
            if (onProcessingError) {
              onProcessingError('Error processing minutes data');
            }
          }
        }
      }
    });
    
    socketRef.current.on('processing_error', (data: any) => {
      console.error('Processing error:', data);
      if (data.job_id === jobId) {
        const errorMessage = data.error || 'An error occurred during processing';
        setError(errorMessage);
        setProcessingStatus('error');
        setUploading(false);
        
        if (onProcessingError) {
          onProcessingError(errorMessage);
        }
      }
    });
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('connect_error');
        socketRef.current.off('disconnect');
        socketRef.current.off('processing_update');
        socketRef.current.off('processing_complete');
        socketRef.current.off('processing_error');
        socketRef.current.disconnect();
      }
    };
  }, [jobId, onNewJobCreated, onProcessingComplete, onProcessingError]);

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    if (onClick) {
      onClick();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0] || null;
    
    if (onFileSelect) {
      onFileSelect(file);
    }
    
    if (file) {
      try {
        setUploading(true);
        setError(null);
        setProcessingStatus('uploading');
        
        // Upload file to the server
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.job_id) {
          setJobId(data.job_id);
          setProcessingStatus(data.status || 'processing');
          
          // Store job ID in localStorage
          localStorage.setItem('lastJobId', data.job_id);
          
          // Call onNewJobCreated callback
          if (onNewJobCreated) {
            onNewJobCreated(data.job_id, data);
          }
        } else {
          throw new Error('No job ID returned from server');
        }
      } catch (error: any) {
        console.error('Error uploading file:', error);
        setError(error.message || 'Failed to upload file');
        setUploading(false);
        setProcessingStatus('error');
        if (onProcessingError) {
          onProcessingError(error.message || 'Failed to upload file');
        }
      }
    }
  };

  return (
    <>
      <div className={`file-upload-container ${uploading ? 'uploading' : ''}`}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={handleFileUploadClick}>
          <path d="M19.9857 21.4319C19.7574 21.4319 19.5576 21.3748 19.3578 21.2891L0.80506 12.005C0.563773 11.888 0.360283 11.7054 0.2179 11.4781C0.075517 11.2507 0 10.9878 0 10.7195C0 10.4512 0.075517 10.1883 0.2179 9.96095C0.360283 9.7336 0.563773 9.55099 0.80506 9.43403L19.3578 0.149973C19.7574 -0.0499911 20.2426 -0.0499911 20.6422 0.149973L39.1949 9.43403C39.4362 9.55099 39.6397 9.7336 39.7821 9.96095C39.9245 10.1883 40 10.4512 40 10.7195C40 10.9878 39.9245 11.2507 39.7821 11.4781C39.6397 11.7054 39.4362 11.888 39.1949 12.005L20.6422 21.2891C20.4424 21.4033 20.2141 21.4319 20.0143 21.4319H19.9857ZM4.62978 10.7195L19.9857 18.4039L35.3417 10.7195L19.9857 3.03517L4.62978 10.7195Z" fill="#F8F8F8"/>
          <path d="M19.9857 30.7159C19.7574 30.7159 19.5576 30.6588 19.3578 30.5731L0.80506 21.289C0.563773 21.1721 0.360283 20.9895 0.2179 20.7621C0.075517 20.5348 0 20.2719 0 20.0036C0 19.7352 0.075517 19.4724 0.2179 19.245C0.360283 19.0177 0.563773 18.835 0.80506 18.7181L10.0814 14.0903C10.795 13.7475 11.6513 14.0332 11.9938 14.7188C12.3363 15.433 12.0509 16.2899 11.3658 16.6327L4.62978 20.0036L19.9857 27.6879L35.3417 20.0036L28.6056 16.6327C28.4365 16.5509 28.2856 16.4358 28.1618 16.2943C28.0381 16.1528 27.9442 15.9878 27.8856 15.8092C27.827 15.6306 27.8049 15.442 27.8207 15.2546C27.8366 15.0673 27.8899 14.885 27.9777 14.7188C28.3202 14.0046 29.1765 13.719 29.89 14.0903L39.1664 18.7181C39.4077 18.835 39.6112 19.0177 39.7536 19.245C39.8959 19.4724 39.9715 19.7352 39.9715 20.0036C39.9715 20.2719 39.8959 20.5348 39.7536 20.7621C39.6112 20.9895 39.4077 21.1721 39.1664 21.289L20.6137 30.5731C20.4139 30.6874 20.1855 30.7159 19.9857 30.7159Z" fill="#F8F8F8" />
          <path d="M19.9857 40C19.7574 40 19.5576 39.9429 19.3578 39.8572L0.80506 30.5731C0.563773 30.4562 0.360283 30.2735 0.2179 30.0462C0.075517 29.8188 0 29.5559 0 29.2876C0 29.0193 0.075517 28.7564 0.2179 28.5291C0.360283 28.3017 0.563773 28.1191 0.80506 28.0021L10.0814 23.3744C10.795 23.0316 11.6513 23.3173 11.9938 24.0028C12.3363 24.717 12.0509 25.574 11.3658 25.9168L4.62978 29.2876L19.9857 36.972L35.3417 29.2876L28.6056 25.9168C28.4365 25.835 28.2856 25.7199 28.1618 25.5784C28.0381 25.4369 27.9442 25.2719 27.8856 25.0933C27.827 24.9146 27.8049 24.726 27.8207 24.5387C27.8366 24.3513 27.8899 24.1691 27.9777 24.0028C28.3202 23.2887 29.1765 23.003 29.89 23.3744L39.1664 28.0021C39.4077 28.1191 39.6112 28.3017 39.7536 28.5291C39.8959 28.7564 39.9715 29.0193 39.9715 29.2876C39.9715 29.5559 39.8959 29.8188 39.7536 30.0462C39.6112 30.2735 39.4077 30.4562 39.1664 30.5731L20.6137 39.8572C20.4139 39.9714 20.1855 40 19.9857 40Z" fill="#F8F8F8" />
        </svg>
        {uploading && (
          <div className="upload-status">
            <div className="upload-spinner"></div> 
            <span>{getStatusMessage(processingStatus)}</span>
          </div>
        )}
        {error && <div className="upload-error">{error}</div>}
      </div>
      <input
        type="file"
        accept=".mp3,.wav,.m4a,.ogg,.vtt"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        ref={fileInputRef}
      />
    </>
  );
};

// Helper function to get status messages
function getStatusMessage(status: string): string {
  switch (status) {
    case 'uploading': return 'Uploading file...';
    case 'processing': return 'Processing file...';
    case 'processing_audio': return 'Analyzing audio...';
    case 'processing_vtt': return 'Analyzing transcript...';
    case 'generating_minutes': return 'Generating minutes...';
    case 'generating_pdf': return 'Creating document...';
    case 'completed': return 'Processing complete!';
    case 'error': return 'Error processing file';
    default: return 'Processing...';
  }
}

// Map icon types to components
const iconComponents: Record<ButtonNavBarProps['type'], React.FC<any>> = {
  arrow: ArrowIcon,
  upload: UploadIcon,
  files: FilesIcon,
};

const ButtonNavBar: React.FC<ButtonNavBarProps> = ({ 
  type, 
  onClick, 
  label, 
  onFileSelect, 
  onProcessingComplete, 
  onProcessingError,
  onNewJobCreated
}) => {
  const IconComponent = iconComponents[type];

  return (
    <button
      className={`nav-button ${type}-button`}
      onClick={() => {
        if (type !== 'files' && onClick) {
          onClick();
        }
      }}
      aria-label={label || type}
    >
      {type === 'files' ? (
        <FilesIcon 
          onFileSelect={onFileSelect} 
          onClick={onClick}
          onProcessingComplete={onProcessingComplete}
          onProcessingError={onProcessingError}
          onNewJobCreated={onNewJobCreated}
        />
      ) : (
        <IconComponent />
      )}
    </button>
  );
};

export default ButtonNavBar;
