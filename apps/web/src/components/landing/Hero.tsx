"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="bg-[#eaf4ff] py-20 px-10 text-center overflow-hidden">

      {/* TEXT */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-bold mb-6"
      >
        A goal without a plan is just a wish.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-8 max-w-xl mx-auto"
      >
        Manage, discover and participate in campus events easily at AASTU.
      </motion.p>

      <motion.button
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition mb-16"
      >
        Get Started
      </motion.button>

      {/* IMAGES */}
      <div className="flex justify-center items-end gap-6">

        <motion.img
          src="/img2.webp"
          className="w-[220px] h-[260px] object-cover rounded-3xl shadow-lg mt-10"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        />

        <motion.img
          src="/img3.webp"
          className="w-[260px] h-[300px] object-cover rounded-3xl shadow-xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        />

        <motion.img
          src="/img4.jpg"
          className="w-[220px] h-[260px] object-cover rounded-3xl shadow-lg mt-10"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        />

      </div>
    </section>
  );
}