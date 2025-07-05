import FormComponent from "@/components/forms/FormComponent"
import { LuCode2, LuUsers, LuMessageSquare, LuPencil, LuGithub, LuTwitter, LuLinkedin } from "react-icons/lu"
import { motion } from "framer-motion"

function HomePage() {
    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-black">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    className="absolute -left-4 top-0 h-[30rem] w-[30rem] sm:h-[40rem] sm:w-[40rem] rounded-full bg-purple-500/10 blur-3xl opacity-30"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.4, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div 
                    className="absolute -right-4 bottom-0 h-[30rem] w-[30rem] sm:h-[40rem] sm:w-[40rem] rounded-full bg-blue-500/10 blur-3xl opacity-30"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.35, 0.3],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div 
                    className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] sm:h-[50rem] sm:w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl opacity-20"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.25, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
                <div className="w-full max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div 
                        className="mb-6 sm:mb-10 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div 
                            className="mb-4 sm:mb-6 flex items-center justify-center gap-3 sm:gap-4"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.div 
                                className="rounded-2xl bg-white/5 p-3 sm:p-4 backdrop-blur-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <LuCode2 className="h-8 w-8 sm:h-12 sm:w-12 text-purple-400" />
                            </motion.div>
                            <h1 className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-4xl sm:text-5xl md:text-6xl font-bold text-transparent">
                                Code Collab
                            </h1>
                        </motion.div>
                        <motion.p 
                            className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-gray-400 px-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            A real-time collaborative coding environment where teams can code, chat, and create together seamlessly.
                        </motion.p>
                    </motion.div>

                    {/* Main Form */}
                    <motion.div 
                        className="mb-8 sm:mb-12 px-4 sm:px-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <div className="mx-auto max-w-md glass-panel rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                            <FormComponent />
                        </div>
                    </motion.div>

                    {/* Features */}
                    <motion.div 
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                    >
                        <motion.div 
                            className="glass-panel group rounded-2xl border border-white/10 bg-black/50 p-4 sm:p-6 transition-all duration-300 hover:bg-white/5 hover:shadow-lg backdrop-blur-xl"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="mb-3 sm:mb-4 inline-block rounded-xl bg-purple-500/10 p-2 sm:p-3 text-purple-400 group-hover:bg-purple-500/20">
                                <LuUsers className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-white">Real-time Collaboration</h3>
                            <p className="text-sm sm:text-base text-gray-400">Code together with your team in real-time with seamless synchronization.</p>
                        </motion.div>
                        <motion.div 
                            className="glass-panel group rounded-2xl border border-white/10 bg-black/50 p-4 sm:p-6 transition-all duration-300 hover:bg-white/5 hover:shadow-lg backdrop-blur-xl"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="mb-3 sm:mb-4 inline-block rounded-xl bg-indigo-500/10 p-2 sm:p-3 text-indigo-400 group-hover:bg-indigo-500/20">
                                <LuMessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-white">Live Chat</h3>
                            <p className="text-sm sm:text-base text-gray-400">Communicate with your team instantly while coding using the built-in chat.</p>
                        </motion.div>
                        <motion.div 
                            className="glass-panel group rounded-2xl border border-white/10 bg-black/50 p-4 sm:p-6 transition-all duration-300 hover:bg-white/5 hover:shadow-lg backdrop-blur-xl"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="mb-3 sm:mb-4 inline-block rounded-xl bg-blue-500/10 p-2 sm:p-3 text-blue-400 group-hover:bg-blue-500/20">
                                <LuPencil className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-white">Drawing Board</h3>
                            <p className="text-sm sm:text-base text-gray-400">Visualize ideas and explain concepts using the collaborative drawing tool.</p>
                        </motion.div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div 
                        className="mt-8 sm:mt-12 text-center px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                    >
                        <div className="flex justify-center gap-4 sm:gap-6 mb-3 sm:mb-4">
                            <motion.a 
                                href="https://github.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <LuGithub className="h-5 w-5 sm:h-6 sm:w-6" />
                            </motion.a>
                            <motion.a 
                                href="https://twitter.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <LuTwitter className="h-5 w-5 sm:h-6 sm:w-6" />
                            </motion.a>
                            <motion.a 
                                href="https://linkedin.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <LuLinkedin className="h-5 w-5 sm:h-6 sm:w-6" />
                            </motion.a>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                            © 2024 Code Collab. All rights reserved.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default HomePage
