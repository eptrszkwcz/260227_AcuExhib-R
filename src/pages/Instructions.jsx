import { useNavigate } from 'react-router-dom'
import { Title, PrimaryText, PrimaryButton } from '../components/ui'

const INSTRUCTION_IMG_W_PX = 368
const INSTRUCTION_IMG_H_PX = 274
const INSTRUCTION_IMAGES = [
  { key: 'seatbelt', src: '/images/instructions/seatbelt.png', label: 'seatbelt violation', icon: '/icons/icon_seatbelt.svg', isSafe: false },
  { key: 'distracted', src: '/images/instructions/distracted.png', label: 'distracted driving', icon: '/icons/icon_distracted.svg', isSafe: false },
  { key: 'safe', src: '/images/instructions/safe.png', label: 'safe driving', icon: '/icons/icon_safeDriving.svg', isSafe: true },
]

export default function Instructions() {
  const navigate = useNavigate()

  return (
    <div className="w-full h-full bg-page-bg flex items-center justify-center">
      <div className="flex flex-col items-center">
        {/* Title */}
        <Title className="text-center">How to play...</Title>

        {/* Instructional text */}
        <PrimaryText
          as="p"
          className="text-center max-w-[1400px] mt-8 px-8"
        >
          Determine if vehicle occupants are not wearing their seatbelt, are
          illegally using their phones or are driving safely.
          <br />
          Use buttons to sort the photos.
        </PrimaryText>

        {/* Three instruction images with sorting-button overlay (centered, not clickable) */}
        <div className="flex items-center justify-center gap-8 mt-12">
          {INSTRUCTION_IMAGES.map(({ key, src, label, icon, isSafe }) => (
            <div
              key={key}
              className="rounded-ui overflow-hidden flex-shrink-0 relative"
              style={{ width: INSTRUCTION_IMG_W_PX, height: INSTRUCTION_IMG_H_PX }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                aria-hidden
              />
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                aria-hidden
              >
                <div
                  className={`
                    w-btn-sorting h-btn-sorting rounded-ui font-medium text-btn-sorting
                    bg-btn-sorting-bg opacity-100
                    flex flex-col items-center justify-center gap-2
                    ${isSafe ? 'text-[#1C8854] shadow-btn-sorting-safe' : 'text-[#D23E3E] shadow-btn-sorting-danger'}
                  `}
                >
                  <img src={icon} alt="" className="w-14 h-14 shrink-0" aria-hidden />
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div className="mt-12">
          <PrimaryButton theme="acusensus" onPress={() => navigate('/player-mode')}>
            I'M READY
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
