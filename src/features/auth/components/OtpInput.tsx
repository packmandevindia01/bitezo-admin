import { useRef } from "react";

interface Props {
    value: string[];
    onChange: (value: string[]) => void;
    onComplete?: () => void;
}

const OtpInput = ({ value, onChange, onComplete }: Props) => {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (val: string, index: number) => {
        // Strip non-digits
        const digit = val.replace(/\D/g, "").slice(-1);

        const newOtp = [...value];
        newOtp[index] = digit;
        onChange(newOtp);

        // Auto-advance to next box if digit entered
        if (digit && index < 5) {
            inputs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits are filled
        if (digit && index === 5 && newOtp.every((d) => d !== "")) {
            onComplete?.();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        // Backspace: if current is empty, focus previous and clear it
        if (e.key === "Backspace") {
            if (!value[index] && index > 0) {
                e.preventDefault();
                const newOtp = [...value];
                newOtp[index - 1] = "";
                onChange(newOtp);
                inputs.current[index - 1]?.focus();
            }
        }
        // Enter: trigger complete if all filled
        if (e.key === "Enter") {
            e.preventDefault();
            if (value.every((d) => d !== "")) {
                onComplete?.();
            } else {
                const firstEmpty = value.findIndex((d) => d === "");
                if (firstEmpty !== -1) inputs.current[firstEmpty]?.focus();
            }
        }
        // Arrow keys
        if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault();
            inputs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < 5) {
            e.preventDefault();
            inputs.current[index + 1]?.focus();
        }
    };

    // ── Paste handler: copy-paste 6-digit OTP into any box ────────────────────
    const handlePaste = (e: React.ClipboardEvent, index: number) => {
        e.preventDefault();
        const raw = e.clipboardData.getData("text");
        const digits = raw.replace(/\D/g, "").slice(0, 6);
        if (!digits) return;

        // If a full 6-digit code was pasted, always populate from index 0
        const start = digits.length === 6 ? 0 : index;
        const newOtp = [...value];
        for (let i = 0; i < digits.length; i++) {
            if (start + i < 6) {
                newOtp[start + i] = digits[i];
            }
        }
        onChange(newOtp);

        // Focus the last filled box or box 5
        const lastIndex = Math.min(start + digits.length - 1, 5);
        inputs.current[lastIndex]?.focus();

        // If all 6 boxes are now filled, notify parent immediately
        if (newOtp.every((d) => d !== "")) {
            onComplete?.();
        }
    };

    return (
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={(e) => handlePaste(e, 0)}>
            {value.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    autoFocus={index === 0}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={(e) => handlePaste(e, index)}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-bold border rounded-md outline-none focus:ring-2 focus:ring-[#49293e] transition-shadow bg-white text-gray-800"
                />
            ))}
        </div>
    );
};

export default OtpInput;