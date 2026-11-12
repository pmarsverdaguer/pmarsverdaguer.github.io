import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import {
  PIN_STORAGE_KEY,
  PIN_SESSION_KEY,
  hashPin,
} from '../utils/pinAuth';
import {
  fetchRemoteSharedData,
  pushRemoteSharedData,
  type RemoteSharedPayload,
} from '../utils/supabaseSync';

interface PinLockScreenProps {
  onUnlock: (remoteData?: RemoteSharedPayload) => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [storedHash, setStoredHash] = useState<string | null>(() => {
    try {
      return localStorage.getItem(PIN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [isCheckingRemote, setIsCheckingRemote] = useState<boolean>(!storedHash);

  // Consultar la nube al montar para saber si ya existe un PIN compartido de la pareja
  useEffect(() => {
    let isMounted = true;
    fetchRemoteSharedData().then((remote) => {
      if (!isMounted) return;
      if (remote?.pinHash) {
        setStoredHash(remote.pinHash);
        try {
          localStorage.setItem(PIN_STORAGE_KEY, remote.pinHash);
        } catch {
          // ignore
        }
      } else {
        setStoredHash(null);
        try {
          localStorage.removeItem(PIN_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
      setIsCheckingRemote(false);
    }).catch(() => {
      if (isMounted) setIsCheckingRemote(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Modo: 'unlock' (introducir PIN existente), 'setup_first' (creación), 'setup_confirm' (confirmación)
  const isSettingUp = !storedHash;
  const [setupStep, setSetupStep] = useState<'enter' | 'confirm'>('enter');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Mantener el foco en el input al cargar y al hacer click
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(focusTimer);
  }, [setupStep]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    setPin('');
    inputRef.current?.focus();
  };

  // Manejar el cambio de texto en el input (máx 4 dígitos)
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setErrorMsg(null);

    if (isSettingUp) {
      if (setupStep === 'enter') {
        setPin(val);
        if (val.length === 4) {
          setTimeout(() => {
            setConfirmPin('');
            setSetupStep('confirm');
          }, 200);
        }
      } else {
        setConfirmPin(val);
        if (val.length === 4) {
          if (val === pin) {
            // PIN confirmado con éxito: guardar en local y en Supabase
            setIsSuccess(true);
            const hashed = await hashPin(val);
            localStorage.setItem(PIN_STORAGE_KEY, hashed);
            setStoredHash(hashed);
            sessionStorage.setItem(PIN_SESSION_KEY, 'true');

            // Sincronizar PIN inicial con Supabase
            await pushRemoteSharedData({ pinHash: hashed });

            setTimeout(() => {
              onUnlock();
            }, 500);
          } else {
            triggerError('Los números no coinciden. Inténtalo de nuevo.');
            setTimeout(() => {
              setPin('');
              setConfirmPin('');
              setSetupStep('enter');
            }, 600);
          }
        }
      }
    } else {
      // Modo desbloqueo
      setPin(val);
      if (val.length === 4) {
        const hashed = await hashPin(val);

        // Comprobar contra hash local o remoto
        let valid = hashed === storedHash;
        let remoteData: RemoteSharedPayload | null = null;

        if (!valid) {
          // Por si el PIN fue cambiado desde el otro móvil, consultar Supabase
          const remote = await fetchRemoteSharedData();
          if (remote?.pinHash && remote.pinHash === hashed) {
            valid = true;
            remoteData = remote;
            localStorage.setItem(PIN_STORAGE_KEY, remote.pinHash);
            setStoredHash(remote.pinHash);
          }
        } else {
          // Cargar datos remotos frescos para sincronizar
          remoteData = await fetchRemoteSharedData();
        }

        if (valid) {
          setIsSuccess(true);
          sessionStorage.setItem(PIN_SESSION_KEY, 'true');
          setTimeout(() => {
            onUnlock(remoteData || undefined);
          }, 450);
        } else {
          triggerError('PIN incorrecto. Vuelve a intentarlo.');
        }
      }
    }
  };

  const currentDisplayPin = isSettingUp && setupStep === 'confirm' ? confirmPin : pin;

  return (
    <div
      onClick={handleContainerClick}
      className="fixed inset-0 z-[200] bg-[#fbfaf7] text-[#2c261e] flex flex-col items-center justify-center p-4 sm:p-6 select-none cursor-text"
      style={{
        backgroundImage: 'radial-gradient(#ebe3d5 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Hidden real input - handles mobile numeric keyboard and PC typing */}
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={currentDisplayPin}
        onChange={handleChange}
        autoFocus
        autoComplete="one-time-code"
        className="opacity-0 absolute -top-96 left-0 pointer-events-none"
        aria-label="Introduce el PIN de 4 dígitos"
      />

      {/* Main Card */}
      <div
        className={`bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 border border-[#ded5c5] shadow-2xl flex flex-col items-center text-center transition-all ${
          isShaking ? 'animate-shake' : ''
        } ${isSuccess ? 'ring-4 ring-[#527354]/40 scale-102' : ''}`}
      >
        {/* Icon */}
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5 transition-all shadow-xs ${
            isSuccess
              ? 'bg-[#527354] text-white scale-110'
              : 'bg-[#f0f6f0] border border-[#d2e2d3] text-[#426645]'
          }`}
        >
          {isSuccess ? (
            <Check className="w-7 h-7 stroke-[2.5] animate-scale-up" />
          ) : isSettingUp ? (
            <KeyRound className="w-7 h-7 stroke-[1.8]" />
          ) : (
            <Lock className="w-7 h-7 stroke-[1.8]" />
          )}
        </div>

        {/* Title & Instructions */}
        <h2 className="text-xl sm:text-2xl font-semibold text-[#28332c] tracking-tight">
          {isSettingUp
            ? setupStep === 'enter'
              ? 'Crear PIN de Acceso'
              : 'Confirma tu PIN'
            : 'Introduce tu PIN'}
        </h2>

        <p className="text-xs sm:text-sm text-[#736856] mt-1.5 mb-6 max-w-[260px]">
          {isSettingUp
            ? setupStep === 'enter'
              ? 'Elige 4 números para ti y tu pareja.'
              : 'Vuelve a introducir los 4 dígitos para confirmar.'
            : 'Introduce los 4 dígitos para acceder al planificador.'}
        </p>

        {/* 4 Digit Boxes */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-5">
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = currentDisplayPin.length > index;
            const isCurrent = currentDisplayPin.length === index;

            return (
              <div
                key={index}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-150 ${
                  hasDigit
                    ? 'border-[#527354] bg-[#f2f7f2] text-[#283d2a] shadow-xs'
                    : isCurrent
                    ? 'border-[#8f9f8f] bg-white ring-2 ring-[#527354]/30'
                    : 'border-[#ded4c3] bg-[#faf8f4]'
                }`}
              >
                {hasDigit ? (
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#375239] animate-scale-up" />
                ) : isCurrent ? (
                  <div className="w-1.5 h-6 bg-[#527354] animate-pulse rounded-full" />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        <div className="h-6 mb-2 flex items-center justify-center">
          {errorMsg ? (
            <p className="text-xs font-semibold text-[#b83828] flex items-center gap-1.5 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          ) : isSuccess ? (
            <p className="text-xs font-semibold text-[#375c3a] flex items-center gap-1.5 animate-fade-in">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>¡Acceso correcto!</span>
            </p>
          ) : isCheckingRemote ? (
            <span className="text-[11px] text-[#9c8e78] animate-pulse">
              Comprobando seguridad en la nube...
            </span>
          ) : (
            <span className="text-[11px] text-[#9c8e78]">
              Toca aquí o escribe con tu teclado
            </span>
          )}
        </div>
      </div>

      {/* Shake animation styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};
