import { useNavigate } from 'react-router-dom'
import { Title, PrimaryText, PrimaryButton } from '../components/ui'
import { useGameState } from '../hooks/useGameState'

const PLACEHOLDER_SIZE = 280

export default function PlayerMode() {
  const navigate = useNavigate()
  const { startGame } = useGameState()

  const handleSinglePlayer = () => {
    startGame({ mode: 'single' })
    navigate('/gameplay')
  }

  const handleDoublePlayer = () => {
    startGame({ mode: 'dual' })
    navigate('/gameplay')
  }

  return (
    <div className="w-full h-full bg-page-bg flex items-center justify-center">
      <div className="flex flex-col items-center">
        {/* Title */}
        <Title className="text-center">Choose a player mode</Title>

        {/* Subtitle */}
        <PrimaryText
          as="p"
          className="text-center max-w-[1400px] mt-6 px-6"
        >
          See the Acusensus difference for image classification
        </PrimaryText>

        {/* Two columns: each has a red square centered above its button */}
        <div className="flex items-start justify-center gap-16 mt-12">
          <div className="flex flex-col items-center">
            <div
              className="rounded-ui bg-red-500 flex-shrink-0"
              style={{ width: PLACEHOLDER_SIZE, height: PLACEHOLDER_SIZE }}
            />
            <div className="mt-6">
              <PrimaryButton theme="acusensus" onPress={handleSinglePlayer}>
                SINGLE PLAYER
              </PrimaryButton>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="rounded-ui bg-red-500 flex-shrink-0"
              style={{ width: PLACEHOLDER_SIZE, height: PLACEHOLDER_SIZE }}
            />
            <div className="mt-6">
              <PrimaryButton theme="acusensus" onPress={handleDoublePlayer}>
                DOUBLE PLAYER
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
