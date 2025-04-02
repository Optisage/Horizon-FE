const HistoryIcon = ({ ...className }) => {
    return (
        <svg 
            {...className} 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path 
                d="M10.5 3V1.5H11.5V22.5H10.5V21V20.5H10H5C4.58354 20.5 4.23978 20.3577 3.94155 20.0594C3.64338 19.7613 3.50057 19.4171 3.5 18.9997V5C3.5 4.58381 3.64245 4.24014 3.94125 3.94185C4.24045 3.64317 4.58455 3.50059 5.00024 3.5H10H10.5V3ZM4.5 19V19.5H5H10H10.5V19V17V16.5H10H7.5V15.5H10H10.5V15V13V12.5H10H7.5V11.5H10H10.5V11V9V8.5H10H7.5V7.5H10H10.5V7V5V4.5H10H5H4.5V5V19ZM14 19H14.5V19.5H14V19ZM14.5 20.5H14V21H14.5V20.5ZM14 3.5H14.5V3H14V3.5ZM14.5 4.5H14V5H14.5V4.5ZM14.5 12.5V11.5H16.5V12.5H14.5ZM14.5 8.5V7.5H16.5V8.5H14.5Z" 
                fill="#787891" 
                stroke="#01011D" 
            />
        </svg>

    );
};

export default HistoryIcon;
