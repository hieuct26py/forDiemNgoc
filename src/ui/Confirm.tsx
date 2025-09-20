import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Options = {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  hideCancel?: boolean
}

type ConfirmFn = (opts: Options) => Promise<boolean>

const Ctx = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const resolver = useRef<((v: boolean) => void) | null>(null)
  const [open, setOpen] = useState(false)
  const [opts, setOpts] = useState<Options>({})

  const confirm: ConfirmFn = useCallback((o: Options) => {
    setOpts(o)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = (v: boolean) => {
    const res = resolver.current
    resolver.current = null
    setOpen(false)
    if (res) res(v)
  }

  const value = useMemo(() => confirm, [confirm])

  return (
    <Ctx.Provider value={value}>
      {children}
      {open &&
        createPortal(
          <div className="confirm-backdrop" onClick={() => close(false)}>
            <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
              {opts.title && <div className="modal-title">{opts.title}</div>}
              {opts.message && <div className="modal-body" style={{ paddingTop: 12 }}>{opts.message}</div>}
              <div className="modal-actions">
                {!opts.hideCancel && (
                  <button className="btn" onClick={() => close(false)}>
                    {opts.cancelText ?? 'Cancel'}
                  </button>
                )}
                <button className="primary-btn" onClick={() => close(true)}>
                  {opts.confirmText ?? 'Confirm'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </Ctx.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}

