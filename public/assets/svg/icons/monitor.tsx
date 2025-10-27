const MonitorIcon = ({ className, stroke = "#292D32" }: { className?: string; stroke?: string }) => {
  return (
    <svg
      className={className}
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.8332 18.3619H6.72734C3.0765 18.3619 2.1665 17.4519 2.1665 13.8011V7.30107C2.1665 3.65023 3.0765 2.74023 6.72734 2.74023H18.1348C21.7857 2.74023 22.6957 3.65023 22.6957 7.30107"
        stroke={stroke}
        strokeWidth="1.625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.8335 23.2599V18.3633"
        stroke={stroke}
        strokeWidth="1.625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        opacity="0.4"
        d="M2.1665 14.0293H10.8332"
        stroke={stroke}
        strokeWidth="1.625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.30176 23.2598H10.8334"
        stroke={stroke}
        strokeWidth="1.625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.8339 13.8668V20.0526C23.8339 22.6201 23.1947 23.2593 20.6272 23.2593H16.7814C14.2139 23.2593 13.5747 22.6201 13.5747 20.0526V13.8668C13.5747 11.2993 14.2139 10.6602 16.7814 10.6602H20.6272C23.1947 10.6602 23.8339 11.2993 23.8339 13.8668Z"
        stroke={stroke}
        strokeWidth="1.625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        opacity="0.4"
        d="M18.6816 19.7715H18.6927"
        stroke={stroke}
        strokeWidth="2.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MonitorIcon;