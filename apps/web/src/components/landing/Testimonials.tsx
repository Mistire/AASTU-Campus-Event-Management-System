"use client";
import { motion } from "framer-motion";

export default function Testimonials() {
  return (
    <section className="py-20 px-10 bg-[#f9fbff] text-center">
      <h2 className="text-3xl font-bold mb-12">What Students Say</h2>

      <div className="grid md:grid-cols-3 gap-10">

        {/* CARD */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-6 bg-white rounded-2xl shadow"
        >
          <img
            src="/stud1.webp"
            className="w-20 h-20 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 mb-4">
            {"This system made it so easy to find and join events!"}
          </p>
          <h4 className="font-semibold">Student</h4>
        </motion.div>

        {/* CARD */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-6 bg-white rounded-2xl shadow"
        >
          <img
            src="/org1.webp"
            className="w-20 h-20 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 mb-4">
           { "Event management is now smooth and organized."}
          </p>
          <h4 className="font-semibold">Organizer</h4>
        </motion.div>

        {/* CARD */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-6 bg-white rounded-2xl shadow"
        >
          <img
            src="/stud2.png"
            className="w-20 h-20 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 mb-4">
            {"I never miss events anymore. Highly recommended!"}
          </p>
          <h4 className="font-semibold">Student</h4>
        </motion.div>

      </div>
    </section>
  );
}