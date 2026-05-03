import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Zap, Camera, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cameraGranted, setCameraGranted] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [step, setStep] = useState('camera')

  const requestCamera = useCallback(async () => {
    setCameraLoading(true)
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraGranted(true)
      setStep('form')
    } catch (err) {
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access to continue.'
          : 'Could not access camera. Please check your device.'
      )
    } finally {
      setCameraLoading(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!cameraGranted) { toast.error('Camera permission required'); setStep('camera'); return }
    setLoading(true)
    try {
      const data = await login(form)
      toast.success(`Welcome back, ${data.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-700/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Ethara</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="glass p-8">
          <AnimatePresence mode="wait">
            {step === 'camera' ? (
              <motion.div
                key="camera"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="text-center"
              >
                <div className="relative mx-auto mb-6 w-48 h-36 rounded-2xl overflow-hidden bg-black/50 border-2 border-violet-500/30 flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraGranted ? 'opacity-100' : 'opacity-0'}`} />
                  {!cameraGranted && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Camera className="w-10 h-10 text-violet-400 opacity-60" />
                      <span className="text-xs text-gray-500">Camera preview</span>
                    </div>
                  )}
                  {cameraGranted && (
                    <motion.div
                      className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent"
                      animate={{ top: ['10%', '90%', '10%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-violet-400 rounded-tl" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-violet-400 rounded-tr" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-violet-400 rounded-bl" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-violet-400 rounded-br" />
                </div>

                <h3 className="font-semibold text-white mb-2">Camera Verification Required</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  For security, camera access is required to sign in.
                </p>

                {cameraError && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 text-left">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-300">{cameraError}</p>
                  </div>
                )}

                <button onClick={requestCamera} disabled={cameraLoading} className="btn-primary w-full justify-center">
                  {cameraLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Requesting...</>
                    : <><Camera className="w-4 h-4" /> Enable Camera & Continue</>
                  }
                </button>
                {cameraError && (
                  <button onClick={() => { setCameraError(null); setStep('form') }} className="btn-ghost w-full justify-center mt-2 text-xs">
                    Skip (not recommended)
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
              >
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-300">Camera active</span>
                  <div className="ml-auto w-12 h-9 rounded-lg overflow-hidden border border-emerald-500/30">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <input type="email" placeholder="you@example.com" className="input" value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input pr-11"
                        value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-6">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                    : <>Sign in <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
