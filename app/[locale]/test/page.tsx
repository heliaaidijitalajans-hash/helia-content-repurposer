'use client'

import { useEffect } from 'react'

export default function TestPage() {
  useEffect(() => {
    const btn = document.createElement('button')
    btn.innerText = 'TEST ET'
    btn.style.position = 'fixed'
    btn.style.top = '100px'
    btn.style.left = '100px'
    btn.style.zIndex = '999999'
    btn.style.padding = '20px'
    btn.style.background = 'red'
    btn.onclick = () => alert('ÇALIŞTI')

    document.body.appendChild(btn)
  }, [])

  return null
}