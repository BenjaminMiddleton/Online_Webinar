import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import ButtonNavBar from './ButtonNavBar';
import MinutesContentBox from './MinutesContentBox'; // Add this import
import './UploadTest.css';
const UploadTest = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [processingResults, setProcessingResults] = useState(null);
    const [testStatus, setTestStatus] = useState('idle');
    const [processingError, setProcessingError] = useState(null);
    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setTestStatus('file-selected');
        setProcessingError(null);
        console.log('File selected:', file === null || file === void 0 ? void 0 : file.name);
    };
    const handleProcessingComplete = (minutes) => {
        // Ensure all required fields are present
        const completeMinutes = {
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
    const handleProcessingError = (error) => {
        setProcessingError(error);
        setTestStatus('processing-error');
        console.error('Processing error:', error);
    };
    return (_jsxs("div", { className: "upload-test-container", children: [_jsx("h1", { children: "File Upload Test" }), _jsxs("div", { className: "test-section", children: [_jsx("h2", { children: "Upload Component" }), _jsx("p", { children: "Click the button below to select and upload an audio file:" }), _jsx("div", { className: "button-container", children: _jsx(ButtonNavBar, { type: "files", label: "Upload Audio", onFileSelect: handleFileSelect, onProcessingComplete: handleProcessingComplete, onProcessingError: handleProcessingError }) }), _jsxs("div", { className: "status-panel", children: [_jsx("h3", { children: "Status" }), _jsxs("p", { children: ["Current state: ", _jsx("strong", { children: testStatus })] }), selectedFile && (_jsxs("div", { className: "file-info", children: [_jsx("h4", { children: "Selected File" }), _jsxs("ul", { children: [_jsxs("li", { children: ["Name: ", selectedFile.name] }), _jsxs("li", { children: ["Size: ", Math.round(selectedFile.size / 1024), " KB"] }), _jsxs("li", { children: ["Type: ", selectedFile.type || 'unknown'] })] })] })), processingError && (_jsxs("div", { className: "error-message", children: [_jsx("h4", { children: "Processing Alert" }), _jsx("p", { children: processingError })] }))] }), processingResults && (_jsxs("div", { className: "results-panel", children: [_jsx("h3", { children: "Processing Results" }), _jsxs("div", { className: "result-section", children: [_jsx("h4", { children: "Meeting Title" }), _jsx("p", { children: processingResults.title || 'No title provided' })] }), _jsxs("div", { className: "result-section", children: [_jsx("h4", { children: "Summary" }), _jsx("p", { children: processingResults.summary || 'No summary generated' }), !processingResults.summary && (_jsx("p", { className: "processing-note", children: _jsx("i", { children: "Note: Summary generation was not successful. Please refer to the transcript for meeting content." }) }))] }), processingResults.action_points && processingResults.action_points.length > 0 ? (_jsxs("div", { className: "result-section", children: [_jsx("h4", { children: "Action Points" }), _jsx("ul", { children: processingResults.action_points.map((point, index) => (_jsx("li", { children: point }, index))) })] })) : (_jsxs("div", { className: "result-section", children: [_jsx("h4", { children: "Action Points" }), _jsx("p", { children: _jsx("i", { children: "No action points were identified" }) })] })), processingResults.transcription && (_jsxs("div", { className: "result-section", children: [_jsx("h4", { children: "Transcript" }), _jsx("div", { className: "transcript-container", children: _jsx("pre", { children: processingResults.transcription }) })] })), processingResults.pdf_path && (_jsxs("div", { className: "result-section", children: [_jsx("h4", { children: "Generated Document" }), _jsx("a", { href: `http://localhost:5000${processingResults.pdf_path.replace(/^.*\/pdf/, '/pdf')}`, target: "_blank", rel: "noopener noreferrer", children: "View Generated Document" })] })), processingResults.action_points && processingResults.action_points.length > 0 && (_jsxs("div", { className: "result-section", children: [_jsx("h4", { children: "Action Points (Direct Display)" }), _jsx("ul", { children: processingResults.action_points.map((point, index) => (_jsx("li", { children: point }, index))) })] })), _jsxs("div", { className: "result-section", children: [_jsx("h4", { children: "Action Points (MinutesContentBox Component)" }), _jsx("div", { style: { border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }, children: _jsx(MinutesContentBox, { jobId: processingResults === null || processingResults === void 0 ? void 0 : processingResults.job_id, showActionPoints: true, showSummary: false, showTranscript: false, showMinutesContentBox: true }) })] })] }))] })] }));
};
export default UploadTest;
