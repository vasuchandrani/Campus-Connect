import { useState, useEffect, useCallback } from "react";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Custom hook to dynamically load Razorpay script and initiate checkout.
 */
export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadScript = useCallback(() => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        setIsLoaded(true);
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          setIsLoaded(true);
          resolve(true);
        });
        existingScript.addEventListener("error", () => {
          setIsLoaded(false);
          resolve(false);
        });
        return;
      }

      setIsLoading(true);
      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        setIsLoaded(true);
        setIsLoading(false);
        resolve(true);
      };
      script.onerror = () => {
        setIsLoaded(false);
        setIsLoading(false);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  useEffect(() => {
    loadScript();
  }, [loadScript]);

  const openCheckout = useCallback(
    async ({
      orderId,
      amount,
      currency = "INR",
      key,
      name = "CampusConnect",
      description = "Event Registration",
      image,
      prefill = {},
      notes = {},
      theme = { color: "#6366f1" },
      onSuccess,
      onFailure,
      onDismiss,
    }) => {
      const scriptReady = await loadScript();
      if (!scriptReady || !window.Razorpay) {
        if (onFailure) {
          onFailure(new Error("Failed to load Razorpay SDK. Please check your internet connection."));
        }
        return;
      }

      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY,
        amount,
        currency,
        name,
        description,
        order_id: orderId,
        image,
        prefill: {
          name: prefill.name || "",
          email: prefill.email || "",
          contact: prefill.contact || "",
        },
        notes,
        theme,
        handler: function (response) {
          if (onSuccess) {
            onSuccess({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          }
        },
        modal: {
          ondismiss: function () {
            if (onDismiss) {
              onDismiss();
            }
          },
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          if (onFailure) {
            onFailure(response.error);
          }
        });
        rzp.open();
      } catch (err) {
        if (onFailure) {
          onFailure(err);
        }
      }
    },
    [loadScript]
  );

  return { isLoaded, isLoading, openCheckout };
}

export default useRazorpay;
