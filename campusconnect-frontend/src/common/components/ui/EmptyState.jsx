import React from "react";
import { Card, CardContent } from "./Card";

const EmptyState = ({ icon, title, desc, description, className = "" }) => {
  const displayText = desc || description;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function" || (typeof icon === "object" && (icon.$$typeof || icon.render))) {
      const IconComponent = icon;
      return <IconComponent className="w-8 h-8 text-muted-foreground" />;
    }
    if (typeof icon === "string" || typeof icon === "number") {
      return icon;
    }
    return null;
  };

  return (
    <Card className={`border-dashed ${className}`}>
      <CardContent className="p-8 flex justify-center pt-4">
        <div className="flex items-center gap-4 text-center">
          {icon && (
            <div className="flex-shrink-0">
              {renderIcon()}
            </div>
          )}

          <div className="text-left">
            {title && <h4 className="font-medium">{title}</h4>}
            {displayText && <p className="text-sm text-muted-foreground">{displayText}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;