import React, { useRef, useState, useEffect } from 'react';
import './ButtonNavBar.css';
import { getSocket } from '../api/socketService';

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
  type: 'arrow' | 'upload' | 'files' | 'ap' | 'logout' | 'filter' | 'add'; // Updated to include new types
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

// Upload Icon component - Updated with new SVG
const UploadIcon: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_11218_6537)">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M5 5H18L18 7L18 9H9L9 31H31L31 22H35L35 35H5V5ZM23 5.2H35.03L35.03 17H33.015H31L31 11.5L20.6875 21.3125L18 18.5L28.5 9H23L23 5.2Z" fill="#F8F8F8"/>
    </g>
    <defs>
      <clipPath id="clip0_11218_6537">
        <rect width="40" height="40" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

// Action Points (AP) Icon component - Updated to ensure circles have holes
const APIcon: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 11.5C22.3472 11.5 24.25 9.59719 24.25 7.24998C24.25 4.90276 22.3472 2.99997 20 2.99997C17.6528 2.99997 15.75 4.90276 15.75 7.24998C15.75 9.59719 17.6528 11.5 20 11.5Z" stroke="#F8F8F8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M16.9401 10.31L10.3101 16.94" stroke="#F8F8F8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.25001 24.25C9.59723 24.25 11.5 22.3472 11.5 20C11.5 17.6528 9.59723 15.75 7.25001 15.75C4.90279 15.75 3 17.6528 3 20C3 22.3472 4.90279 24.25 7.25001 24.25Z" stroke="#F8F8F8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M11.4998 20H28.4998" stroke="#F8F8F8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32.75 24.25C35.0972 24.25 37 22.3472 37 20C37 17.6528 35.0972 15.75 32.75 15.75C30.4028 15.75 28.5 17.6528 28.5 20C28.5 22.3472 30.4028 24.25 32.75 24.25Z" stroke="#F8F8F8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M23.0601 29.69L29.6901 23.06" stroke="#F8F8F8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 37C22.3472 37 24.25 35.0973 24.25 32.75C24.25 30.4028 22.3472 28.5 20 28.5C17.6528 28.5 15.75 30.4028 15.75 32.75C15.75 35.0973 17.6528 37 20 37Z" stroke="#F8F8F8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>
);

// LogOut Icon component
const LogOutIcon: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30.26 6.45412L26.9975 9.69529C28.98 10.8814 30.6204 12.5563 31.7596 14.5576C32.8989 16.5588 33.4984 18.8185 33.5 21.1176C33.5 24.6747 32.0777 28.086 29.5459 30.6012C27.0142 33.1164 23.5804 34.5294 20 34.5294C16.4196 34.5294 12.9858 33.1164 10.4541 30.6012C7.92233 28.086 6.50001 24.6747 6.50001 21.1176C6.50001 16.2671 9.11001 12.0424 12.98 9.67294L9.74001 6.45412C7.35014 8.09198 5.39689 10.2825 4.04854 12.837C2.70019 15.3914 1.99716 18.2333 2.00001 21.1176C2.00001 25.8603 3.89643 30.4088 7.27209 33.7624C10.6477 37.116 15.2261 39 20 39C24.7739 39 29.3523 37.116 32.7279 33.7624C36.1036 30.4088 38 25.8603 38 21.1176C38 15.0376 34.94 9.67294 30.26 6.45412ZM22.25 1H17.75V23.3529H22.25" fill="#F8F8F8"/>
  </svg>
);

// Filter Icon component
const FilterIcon: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 333 333" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path style={{fill:"#F8F8F8"}} d="m 258.60914,283.10918 -29.87972,-29.89217 -7.57901,4.94763 C 182.6985,283.26632 133.71945,286.023 92.635261,265.39785 61.664636,249.84992 38.591296,222.88363 27.694313,189.5 19.216406,163.52737 19.570101,133.01655 28.641806,107.76633 35.460736,88.786492 45.207969,73.560654 59.894506,58.947494 78.840085,40.096572 99.622264,28.905794 126,23.351038 c 11.91313,-2.508727 37.30976,-2.521828 49,-0.02528 27.42873,5.857644 50.14923,18.492605 69.07452,38.41263 40.88834,43.037458 47.15738,107.292458 15.36147,157.448488 l -5.71758,9.01912 29.88522,29.89767 29.88522,29.89768 -12.5,12.5 -12.5,12.5 z M 174.5,241.09863 c 16.69783,-4.42272 31.93396,-13.50671 44.05323,-26.26515 C 235.75649,196.72293 244,175.75488 244,150.10753 244,125.78748 237.09664,107.0692 221.13001,88.096119 210.24889,75.166123 190.46977,63.281588 172.49308,58.872004 159.91061,55.785594 141.13226,55.78054 128.5,58.860165 93.250553,67.453642 65.891079,95.76639 58.588231,131.20784 c -1.817665,8.82131 -2.087862,26.604 -0.537251,35.3585 6.672763,37.67331 35.169588,67.18057 72.94902,75.53562 11.46115,2.53467 31.92435,2.06269 43.5,-1.00333 z" />
  </svg>
);

// Add Icon component
const AddIcon: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 333 333" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path style={{fill:"#F8F8F8"}} d="M 144,240 V 189 H 93 42 V 166.5 144 h 51 51 V 93 42 h 22.5 22.5 v 51 51 h 51 51 v 22.5 22.5 h -51 -51 v 51 51 H 166.5 144 Z" />
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

// Files Icon component implementation
const FilesIcon: React.FC<FilesIconProps> = ({ onFileSelect, onClick, onProcessingComplete, onProcessingError, onNewJobCreated }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = getSocket();

    if (socketRef.current) {
      // Only set up event handlers if socket is available
      socketRef.current.on('connect', () => {
        console.log('Socket.IO connected with ID:', socketRef.current?.id);
        setError(null);
      });
  
      socketRef.current.on('connect_error', (err: any) => {
        console.error('Socket.IO connection error:', err);
        setError('Connection error: Unable to reach the server');
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
    } else {
      setError('Unable to establish WebSocket connection');
    }
    
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
  ap: APIcon,
  logout: LogOutIcon,
  filter: FilterIcon,
  add: AddIcon
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