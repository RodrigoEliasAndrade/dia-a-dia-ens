import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WelcomeSlide from './WelcomeSlide';
import BenefitsSlide from './BenefitsSlide';
import LoginSlide from './LoginSlide';
import CoupleSlide from './CoupleSlide';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const { user } = useAuth();

  // Auto-advance from login slide when user logs in
  useEffect(() => {
    if (user && step === 2) {
      setStep(3);
    }
  }, [user, step]);

  return (
    <div className="min-h-screen bg-ens-cream relative">
      {/* Slides */}
      {step === 0 && <WelcomeSlide onNext={() => setStep(1)} />}
      {step === 1 && <BenefitsSlide onNext={() => setStep(2)} />}
      {step === 2 && <LoginSlide />}
      {step === 3 && <CoupleSlide onComplete={onComplete} />}

      {/* Dot indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${i === step ? 'bg-ens-blue w-6' : 'bg-ens-blue/20'}
            `}
          />
        ))}
      </div>
    </div>
  );
}
