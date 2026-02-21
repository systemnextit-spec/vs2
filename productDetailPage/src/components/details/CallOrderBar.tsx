
const CallOrderBar = () => {
    return (
        <div className="w-full flex gap-2 items-center justify-between pt-1">
            {/* Left Icon */}
            <div className="flex items-center gap-3 bg-[#F9F9F9] rounded-md py-3 w-full justify-center">
                <div className="text-[#1E90FF]">
                    {/* Phone Icon */}
                    <img
                        src={'https://details-snit.vercel.app/images/call.svg'}
                        alt='call'
                        width={18}
                        height={18}
                    />
                </div>

                {/* Gradient Text */}
                <p
                    className="text-[18px] font-semibold"
                    style={{
                        background: "linear-gradient(90deg, #38BDF8 0%, #1E90FF 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    কল অর্ডার : 01410-050041
                </p>
            </div>
            {/* Right Share */}
            <button className="p-3.5 bg-[#F9F9F9] rounded-md cursor-pointer">
                <img
                    src='https://details-snit.vercel.app/images/share-01.svg'
                    alt="share"
                    width={24}
                    height={24}
                />

            </button>
        </div>
    );
};

export default CallOrderBar;
