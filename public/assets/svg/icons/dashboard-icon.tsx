const DashboardIcon = ({ ...className }) => {
  return (
    <svg
      {...className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M9.44085 19.8937V17.1294C9.44474 16.424 10.0169 15.8538 10.7223 15.8529H13.3201C14.0285 15.849 14.6064 16.4211 14.6093 17.1294V19.8985C14.6103 20.4979 15.09 20.9873 15.6893 21H17.4213C19.1386 21.0097 20.5397 19.6251 20.5494 17.9078V17.9059V10.0539C20.5377 9.38156 20.2186 8.75106 19.6834 8.34435L13.7619 3.61663C12.7218 2.79446 11.2525 2.79446 10.2124 3.61663L4.31517 8.34825C3.77711 8.75495 3.457 9.38739 3.44922 10.0626V17.9049C3.45798 19.6222 4.85713 21.0087 6.57541 21H8.30927C8.92322 21.0029 9.42334 20.5076 9.42626 19.8937"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DashboardIcon;
