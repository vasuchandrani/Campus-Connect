import React from "react";
import { Card, CardContent } from "./Card";

const EmptyState = ({ icon, title, desc }) => (
  <Card className="border-dashed">
    <CardContent className="p-8 flex justify-center pt-4">
      
      <div className="flex items-center gap-4 text-center">
        
        {/* Icon */}
        <div className="flex-shrink-0">
          {icon}
        </div>

        {/* Text */}
        <div className="text-left">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>

      </div>

    </CardContent>
  </Card>
);

export default EmptyState;