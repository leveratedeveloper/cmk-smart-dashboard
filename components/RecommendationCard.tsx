import React from "react";
import { LightBulbIcon } from "./icons";
import type { AIRecommendation } from "../types";

interface RecommendationCardProps {
  recommendation: AIRecommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <LightBulbIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2">
            {recommendation.title}
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            {recommendation.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
