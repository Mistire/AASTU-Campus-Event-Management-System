export default function Features() {
    return (
        <section className="py-20 px-10 bg-gradient-to-br from-blue-50 via-white to-purple-50 text-center">

            {/* TITLE */}
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-purple-600 bg-clip-text text-transparent">
                Upcoming Events
            </h2>

            <p className="text-gray-500 mb-12">
                Explore What’s Happening on Campus
            </p>

            {/* GRID */}
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">

                {/* CARD 1 */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                    <img src="/event1.jpg" className="w-full h-[250px] object-cover" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-5 flex flex-col justify-end">
                        <h3 className="text-white text-lg font-semibold">Music Festival</h3>
                        <p className="text-gray-300 text-sm mb-3">
                            May 12, 2024 • Campus Grounds
                        </p>

                        <button className="self-end bg-blue-600 px-4 py-1 rounded-md text-white text-sm hover:bg-blue-700 transition">
                            RSVP
                        </button>
                    </div>
                </div>

                {/* CARD 2 */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                    <img src="/event2.jpg" className="w-full h-[250px] object-cover" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-5 flex flex-col justify-end">
                        <h3 className="text-white text-lg font-semibold">
                            Tech Innovation Summit
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                            May 18, 2024 • Main Auditorium
                        </p>

                        <button className="self-end bg-blue-600 px-4 py-1 rounded-md text-white text-sm hover:bg-blue-700 transition">
                            RSVP
                        </button>
                    </div>
                </div>

                {/* CARD 3 */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                    <img src="/event3.jpg" className="w-full h-[250px] object-cover" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-5 flex flex-col justify-end">
                        <h3 className="text-white text-lg font-semibold">
                            Art & Photography Expo
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                            May 20, 2024 • Art Gallery
                        </p>

                        <button className="self-end bg-blue-600 px-4 py-1 rounded-md text-white text-sm hover:bg-blue-700 transition">
                            RSVP
                        </button>
                    </div>
                </div>

                {/* CARD 4 */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                    <img src="/event4.jpg" className="w-full h-[250px] object-cover" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-5 flex flex-col justify-end">
                        <h3 className="text-white text-lg font-semibold">
                            Sports Tournament
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                            May 25, 2024 • Sports Complex
                        </p>

                        <button className="self-end bg-blue-600 px-4 py-1 rounded-md text-white text-sm hover:bg-blue-700 transition">
                            RSVP
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
}