import { useNavigate } from 'react-router-dom'
import { Title, PrimaryText, PrimaryButton } from '../components/ui'

const PLACEHOLDER_W = 374
const PLACEHOLDER_H = 274

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

        {/* Three placeholder images side by side */}
        <div className="flex items-center justify-center gap-8 mt-12">
          <div
            className="rounded-ui bg-red-500 flex-shrink-0"
            style={{ width: PLACEHOLDER_W, height: PLACEHOLDER_H }}
          />
          <div
            className="rounded-ui bg-red-500 flex-shrink-0"
            style={{ width: PLACEHOLDER_W, height: PLACEHOLDER_H }}
          />
          <div
            className="rounded-ui bg-red-500 flex-shrink-0"
            style={{ width: PLACEHOLDER_W, height: PLACEHOLDER_H }}
          />
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
