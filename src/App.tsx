import { Cloud } from 'lucide-react'

export function App() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-6 border shadow rounded-lg">
        <div className="flex gap-4">
          <div>
            <p className="font-bold text-3xl">Weather Dashboard</p>
            <p className="text-zinc-500 text-sm">Tuesday, October 29, 2024</p>
          </div>
          <div>
            <select name="" id=""></select>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="text-zinc-500" />
            <span className="font-bold text-4xl">62°F</span>
          </div>
          <div className='flex flex-col items-end'>
            <p className="font-bold text-xl">Cloudy</p>
            <p className='text-zinc-500 text-sm'>Humidity: 70%</p>
            <p className='text-zinc-500 text-sm'>Wind: 12 mph</p>
          </div>
        </div>
      </div>
    </div>
  )
}
