import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center px-8 py-4 shadow-sm">
            <h1 className="text-xl font-bold">AASTU Events</h1>

            <div className="space-x-6">
                <Link href="/">Home</Link>
                <Link href="#features">Features</Link>
                <Link
                    href="/login"
                    className="bg-blue-100 text-black px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Login
                </Link>
                <button className="bg-blue-600 text-white px-4 py-1 rounded-lg">
                    Get Started
                </button>
            </div>
        </nav>
    );
}