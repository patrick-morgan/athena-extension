import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion } from "framer-motion";

interface BlurredSectionProps {
  title: string;
  content: React.ReactNode;
  isPremium: boolean;
}

export const BlurredSection: React.FC<BlurredSectionProps> = ({
  title,
  content,
  isPremium,
}) => {
  const renderContent = () => {
    if (React.isValidElement(content)) {
      return content;
    } else if (typeof content === "string") {
      return <p>{content}</p>;
    } else {
      return <p>Premium content</p>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {isPremium ? (
          renderContent()
        ) : (
          <motion.div
            className="filter blur-sm select-none"
            whileHover={{ scale: 1.05 }}
          >
            {renderContent()}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
