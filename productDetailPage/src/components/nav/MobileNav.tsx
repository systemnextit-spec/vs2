
export default function MobileNav() {
    return (
        <div>
            <nav className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40">
                <img src="https://details-snit.vercel.app/images/menu-01.svg" alt="Brand" width={24} height={24} className='cursor-pointer' />
                <div className="flex items-center gap-1.5">
                    <a href='/'>
                        <img src="https://details-snit.vercel.app/images/logo.png" alt="Logo" width={155} height={28} />
                    </a>

                </div>
                <div className="flex items-center gap-3 sm:gap-5">
                    <img src="https://details-snit.vercel.app/images/translate.svg" alt="Brand" width={24} height={24} className='cursor-pointer' />
                    <img src="https://details-snit.vercel.app/images/search-01.svg" alt="Brand" width={24} height={24} className='cursor-pointer' />
                    <img src="https://details-snit.vercel.app/images/shopping-cart-02.svg" alt="Brand" width={24} height={24} className='cursor-pointer' />
                    <img src="https://details-snit.vercel.app/images/notification-02.svg" alt="Brand" width={24} height={24} className='cursor-pointer' />
                </div>
            </nav>
        </div>
    )
}
