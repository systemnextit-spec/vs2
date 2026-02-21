interface CallOrderBarProps {
    phoneNumber?: string;
    onShare?: () => void;
}

const CallOrderBar = ({ phoneNumber, onShare }: CallOrderBarProps) => {
    if (!phoneNumber) return null;

    return (
        <div className="w-full flex gap-2 items-center justify-between pt-1">
            <a href={`tel:${phoneNumber}`} className="flex items-center gap-3 bg-[#F9F9F9] rounded-md py-3 w-full justify-center">
                <div className="text-[#1E90FF]">
                    <img
                        src={'https://details-snit.vercel.app/images/call.svg'}
                        alt='call'
                        width={18}
                        height={18}
                    />
                </div>
                <p
                    className="text-[18px] font-semibold"
                    style={{
                        background: "linear-gradient(90deg, #38BDF8 0%, #1E90FF 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Call Order : {phoneNumber}
                </p>
            </a>
            <button onClick={onShare} className="p-3.5 bg-[#F9F9F9] rounded-md cursor-pointer">
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
