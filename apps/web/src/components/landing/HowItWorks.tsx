export default function HowItWorks() {
  const steps = [
    {
      icon: "📝",
      title: "Create Event",
      desc: "Organizers submit and publish campus events easily.",
    },
    {
      icon: "🔍",
      title: "Explore Events",
      desc: "Students browse and discover trending activities.",
    },
    {
      icon: "🎟",
      title: "Register",
      desc: "Join events quickly with a simple registration.",
    },
    {
      icon: "🎉",
      title: "Attend",
      desc: "Participate and enjoy the campus experience.",
    },
  ];

  return (
    <section className="py-24 bg-white text-center">
      <h2 className="text-4xl font-bold mb-20">How CEMS Works</h2>

      <div className="relative flex flex-col md:flex-row justify-center items-center gap-16">

        {/* DOTTED CURVE LINE (background) */}
        <div className="hidden md:block absolute top-12 left-0 w-full h-40 pointer-events-none">
          <svg width="100%" height="100%">
            <path
              d="M50 80 C200 0, 400 160, 600 80 S1000 0, 1200 80"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          </svg>
        </div>

        {steps.map((step, index) => (
          <div
            key={index}
            className={`relative flex flex-col items-center text-center max-w-xs
              ${index % 2 !== 0 ? "md:mt-16" : ""}
            `}
          >
            {/* ICON BOX */}
            <div className="bg-blue-600 text-white w-25 h-25 flex items-center justify-center rounded-xl shadow-lg mb-4 text-xl">
              {step.icon}
            </div>

            {/* TEXT */}
            <h3 className="font-semibold text-lg mb-2">
              {step.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}