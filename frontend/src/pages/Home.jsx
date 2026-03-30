import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ArrowRight } from "lucide-react";

// 🔹 Direct backend URL
const BACKEND_URL = "http://Visual-debugger-backend-env-2.eba-6fwipzcc.ap-south-1.elasticbeanstalk.com";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Call backend session API from Elastic Beanstalk
    fetch(`${BACKEND_URL}/api/session`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Session check error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">Not authenticated. Please log in.</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl"
      >
        <h1 className="text-5xl font-extrabold mb-6">
          Debug Smarter, <span className="text-blue-400">See the Flow</span>
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Visualize your code execution with flowcharts, variable tracking, and
          AI-powered explanations. The modern way to learn, debug, and
          understand code.
        </p>
        <Button>
          <a href="/debugger" className="flex items-center gap-2">
            Get Started <ArrowRight />
          </a>
        </Button>
      </motion.div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Card>
            <CardContent>
              <h3 className="text-xl font-semibold mb-2 text-blue-400">
                Interactive Flowcharts
              </h3>
              <p className="text-gray-300 text-sm">
                Watch your code transform into dynamic flowcharts that update as
                you step through execution.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card>
            <CardContent>
              <h3 className="text-xl font-semibold mb-2 text-blue-400">
                AI Explanations
              </h3>
              <p className="text-gray-300 text-sm">
                Get line-by-line natural language insights powered by AI to
                understand your code better.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card>
            <CardContent>
              <h3 className="text-xl font-semibold mb-2 text-blue-400">
                Save & Share Sessions
              </h3>
              <p className="text-gray-300 text-sm">
                Save debugging history and share sessions with friends,
                classmates, or colleagues.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
