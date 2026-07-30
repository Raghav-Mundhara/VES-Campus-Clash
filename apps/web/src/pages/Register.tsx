import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerSchema, RegisterData } from '../lib/schemas'
import { postRegister } from '../lib/api'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    institute: '',
    course: '',
    year: '',
    igHandle: ''
  })
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterData, boolean>>>({})
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({})
  const [isValid, setIsValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const result = registerSchema.safeParse(formData)
    setIsValid(result.success)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterData, string>> = {}
      result.error.issues.forEach(issue => {
        const path = issue.path[0] as keyof RegisterData
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      })
      setErrors(fieldErrors)
    } else {
      setErrors({})
    }
  }, [formData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const token = localStorage.getItem('ves_session_token')
      if (!token) throw new Error('No session token found')

      await postRegister(token, formData)
      navigate('/game', { replace: true })
    } catch (err: any) {
      setSubmitError(err.message || 'Registration failed')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-800">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
            Player Registration
          </h1>
          <p className="mt-2 text-zinc-400">
            Enter your details to enter the clash.
          </p>
        </div>

        {submitError && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {(['name', 'institute', 'course', 'year', 'igHandle'] as const).map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm font-medium text-zinc-300 capitalize mb-1">
                {field === 'igHandle' ? 'Instagram Handle' : field}
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors ${
                  touched[field] && errors[field]
                    ? 'border-red-500'
                    : 'border-zinc-800'
                }`}
                placeholder={`Enter your ${field === 'igHandle' ? 'Instagram handle' : field}`}
              />
              {touched[field] && errors[field] && (
                <p className="mt-1 text-sm text-red-500">{errors[field]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-bold text-black transition-all ${
              isValid && !isSubmitting
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 shadow-lg shadow-yellow-500/20'
                : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Registering...' : 'Join the Clash'}
          </button>
        </form>
      </div>
    </div>
  )
}
