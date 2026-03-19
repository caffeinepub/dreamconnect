declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.head.appendChild(script);
  });
}

interface RazorpayCheckoutOptions {
  amount: number; // in rupees
  description: string;
  onSuccess: (paymentId: string) => void;
  onFailure: () => void;
}

export async function openRazorpayCheckout({
  amount,
  description,
  onSuccess,
  onFailure,
}: RazorpayCheckoutOptions): Promise<void> {
  await loadRazorpayScript();

  const options = {
    key: "rzp_live_SRplXhiEy9ukdv",
    amount: amount * 100, // paise
    currency: "INR",
    name: "letzclub",
    description,
    theme: { color: "#6d28d9" },
    handler: (response: any) => {
      onSuccess(response.razorpay_payment_id);
    },
    modal: {
      ondismiss: () => {
        onFailure();
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", () => {
    onFailure();
  });
  rzp.open();
}
