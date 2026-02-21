
export default function Footer() {
    return (
        <footer
            className="w-full"
            style={{ fontFamily: "'Lato', sans-serif" }}
        >
            <div className="mx-auto max-w-[1720px] bg-white rounded-t-[112px] px-20 pt-14 pb-6 max-md:px-6 max-md:pt-10 max-md:rounded-t-[48px]">

                {/* ── DESKTOP layout (md and above) ── */}
                <div className="hidden md:flex flex-row items-start justify-between gap-8">

                    <div className="flex flex-col gap-4 max-w-[220px]">
                        <img src="https://details-snit.vercel.app/images/footerlogo.png" alt="Logo" width={169} height={0} />
                        <p className="text-[13px] font-inter text-black text-sm leading-[1.7] mt-1">
                            we create possibilities
                            <br />
                            for the connected
                            <br />
                            world.
                        </p>
                    </div>

                    <div className="flex flex-row gap-20">
                        {/* VISIT */}
                        <div className="flex flex-col gap-3">
                            <h4 className="text-[16px] font-semibold text-[#112F63] font-inter uppercase tracking-wider">
                                VISIT
                            </h4>
                            <p className="text-[12px] text-black leading-[1.8] font-medium font-inter">
                                D-14/3, Bankcolony,
                                <br />
                                Savar, Dhaka-1340
                            </p>
                        </div>

                        {/* QUICK LINK */}
                        <div className="flex flex-col gap-[20px]">
                            <h4 className="text-[16px] font-semibold text-[#112F63] font-inter uppercase tracking-wider">
                                QUICK LINK
                            </h4>
                            <ul className="flex flex-col gap-2">
                                {["Products", "Categories", "Campaigns"].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-[12px] text-black leading-[1.8] font-medium font-inter">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* USEFUL LINK */}
                        <div className="flex flex-col gap-[20px]">
                            <h4 className="text-[16px] font-semibold text-[#112F63] font-inter uppercase tracking-wider">
                                USEFUL LINK
                            </h4>
                            <ul className="flex flex-col gap-2">
                                {["Facebook", "Instagram", "Twitter"].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-[12px] text-black leading-[1.8] font-medium font-inter">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* LEGAL */}
                        <div className="flex flex-col gap-[20px]">
                            <h4 className="text-[16px] font-semibold text-[#112F63] font-inter uppercase tracking-wider">
                                LEGAL
                            </h4>
                            <ul className="flex flex-col gap-2">
                                {["Terms & Condition", "Privacy Policy", "Return Policy"].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-[12px] text-black leading-[1.8] font-medium font-inter">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ── MOBILE layout (below md) ── */}
                <div className="flex md:hidden flex-col items-center gap-4 pb-28">
                    {/* Logo */}
                    <img src="https://details-snit.vercel.app/images/footerlogo.png" alt="Logo" width={140} height={40} />

                    {/* Copyright */}
                    <p className="text-sm font-inter font-medium text-[#635C5C] text-center">
                        Oversear Products © 2026. All rights reserved.
                    </p>

                    {/* Social Icons */}
                    <div className="flex flex-row items-center gap-6 mt-1">
                        {/* YouTube */}
                        <a href="#" aria-label="YouTube">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M10 15L15.19 12L10 9V15ZM21.56 7.17C21.69 7.64 21.78 8.27 21.84 9.07C21.91 9.87 21.94 10.56 21.94 11.16L22 12C22 14.19 21.84 15.8 21.56 16.83C21.31 17.73 20.73 18.31 19.83 18.56C19.36 18.69 18.5 18.78 17.18 18.84C15.88 18.91 14.69 18.94 13.59 18.94L12 19C7.81 19 5.2 18.84 4.17 18.56C3.27 18.31 2.69 17.73 2.44 16.83C2.31 16.36 2.22 15.73 2.16 14.93C2.09 14.13 2.06 13.44 2.06 12.84L2 12C2 9.81 2.16 8.2 2.44 7.17C2.69 6.27 3.27 5.69 4.17 5.44C4.64 5.31 5.5 5.22 6.82 5.16C8.12 5.09 9.31 5.06 10.41 5.06L12 5C16.19 5 18.8 5.16 19.83 5.44C20.73 5.69 21.31 6.27 21.56 7.17Z" fill="#153060" />
                            </svg>
                        </a>
                        {/* Instagram */}
                        <a href="#" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M7.8 2H16.2C19.4 2 22 4.6 22 7.8V16.2C22 17.7383 21.3889 19.2135 20.3012 20.3012C19.2135 21.3889 17.7383 22 16.2 22H7.8C4.6 22 2 19.4 2 16.2V7.8C2 6.26174 2.61107 4.78649 3.69878 3.69878C4.78649 2.61107 6.26174 2 7.8 2ZM7.6 4C6.64522 4 5.72955 4.37928 5.05442 5.05442C4.37928 5.72955 4 6.64522 4 7.6V16.4C4 18.39 5.61 20 7.6 20H16.4C17.3548 20 18.2705 19.6207 18.9456 18.9456C19.6207 18.2705 20 17.3548 20 16.4V7.6C20 5.61 18.39 4 16.4 4H7.6ZM17.25 5.5C17.5815 5.5 17.8995 5.6317 18.1339 5.86612C18.3683 6.10054 18.5 6.41848 18.5 6.75C18.5 7.08152 18.3683 7.39946 18.1339 7.63388C17.8995 7.8683 17.5815 8 17.25 8C16.9185 8 16.6005 7.8683 16.3661 7.63388C16.1317 7.39946 16 7.08152 16 6.75C16 6.41848 16.1317 6.10054 16.3661 5.86612C16.6005 5.6317 16.9185 5.5 17.25 5.5ZM12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 13.3261 16.4732 14.5979 15.5355 15.5355C14.5979 16.4732 13.3261 17 12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 10.6739 7.52678 9.40215 8.46447 8.46447C9.40215 7.52678 10.6739 7 12 7ZM12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9Z" fill="#153060" />
                            </svg>
                        </a>
                        {/* Facebook */}
                        <a href="#" aria-label="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M9.198 21.5H13.198V13.49H16.802L17.198 9.51H13.198V7.5C13.198 7.23478 13.3034 6.98043 13.4909 6.79289C13.6784 6.60536 13.9328 6.5 14.198 6.5H17.198V2.5H14.198C12.8719 2.5 11.6002 3.02678 10.6625 3.96447C9.72479 4.90215 9.198 6.17392 9.198 7.5V9.51H7.198L6.802 13.49H9.198V21.5Z" fill="#153060" />
                            </svg>
                        </a>
                        {/* Globe / Website */}
                        <a href="#" aria-label="Website">
                            <img src="https://details-snit.vercel.app/images/global.svg" alt="Globe" width={24} height={24} />
                        </a>
                    </div>

                    {/* Website URL */}
                    <a href="https://www.opbd.shop" className="text-[13px] text-[#3FC3D7] font-medium font-inter">
                        www.opbd.shop
                    </a>
                </div>

                {/* ── Desktop Copyright ── */}
                <p className="hidden md:block text-[12px] font-inter font-medium text-black mt-6">
                    ©2026 System Next IT, All right reserved.
                </p>
            </div>
        </footer>
    );
}