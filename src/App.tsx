import { BanIcon } from '@heroicons/react/solid'
import clsx from 'clsx'
import { Suspense, useEffect, useState } from 'react'
import {
  AlertComponentPropsWithStyle,
  positions,
  Provider as AlertProvider,
  transitions,
  useAlert,
} from 'react-alert'
import NearLogo from './assets/logo-white.svg'
import { login, logout } from './near-utils'

const IMAGE_LINK = 'https://bafybeignggk33ug2lq5zsbpqmjyha2clxqifuag2im3yvaeksimmfxpcjm.ipfs.dweb.link/'


type Candidates = Record<string, number>

const api = {
  async get_candidates() {
    // @ts-expect-error
    const res = (await window.contract.get_candidates()) as any[]
    const candidates: Candidates = {}
    for (let x of res) candidates[x[0]] = x[1].votes
    return candidates
  },

  async vote(candidate: string): Promise<boolean> {
    // @ts-expect-error
    return window.contract.vote({ candidate }).then(
      (d: undefined) => true,
      (d: string) => false
    )
  },

  async add_candidate(candidate: string) {
    // @ts-expect-error
    return window.contract.add_candidate({ candidate }).then(
      (d: undefined) => true,
      (d: string) => false
    )
  },
}

const Login: React.FC = () => {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="text-center hero-content">
        <div className="max-w-lg">
          <h1 className="mb-5 text-5xl font-bold">
            Welcome to Vetal's submission of App 10
          </h1>
          <p className="mb-5 text-2xl">
            This is a concept of DCS system for airport 
            <br />
            - you can check-in passengers (cannot checkin same PAX)
            <br />
            - you can Mint NFT Boarding pass for passengers
            <br />
            You need to sign-in using NEAR Wallet to use this app
          </p>
          <button className="btn btn-primary" onClick={login}>
            Log in
          </button>
        </div>
      </div>
    </div>
  )
}

type AddCandidateProps = { onClick: (name: string) => void }

const AddCandidate: React.FC<AddCandidateProps> = ({ onClick }) => {
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')

  const click = async () => {
    const name = value.trim()
    if (name.length === 0) return

    setLoading(true)
    await onClick(name)
    setValue('')
    setLoading(false)
  }

  return (
    <div className="form-control">
      <div className="relative">
        <input
          type="text"
          placeholder="Add PAX to check-in"
          className="w-full pr-16 input input-primary input-bordered"
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <button
          className={clsx(
            'absolute top-0 right-0 rounded-l-none btn btn-primary',
            loading ? 'loading' : ''
          )}
          onClick={click}
        >
          add
        </button>
      </div>
    </div>
  )
}

type LoadingButtonProps = { onClick: () => void }

const LoadingButton: React.FC<LoadingButtonProps> = ({ children, onClick }) => {
  const [laoding, setLoading] = useState(false)

  const click = async () => {
    setLoading(true)
    await onClick()
    setLoading(false)
  }

  return (
    <button
      className={clsx('btn btn-accent btn-sm', laoding ? 'loading' : '')}
      onClick={click}
    >
      {children}
    </button>
  )
}

const Main: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidates>({})
  const alert = useAlert()

  useEffect(() => {
    api.get_candidates().then(setCandidates)
  }, [])

  const vote = async (candidate: string) => {
    const res = await api.vote(candidate)
    if (!res) {
      alert.show(`You have already printed boarding pass for ${candidate}!`)
      return
    }

    const upd = await api.get_candidates()
    setCandidates(upd)
  }

  const addCandidate = async (candidate: string) => {
    const res = await api.add_candidate(candidate)
    if (!res) {
      alert.show(`Passenger "${candidate}" already in boarding list!`)
      return
    }

    const upd = await api.get_candidates()
    setCandidates(upd)
  }

  const candidatesList = Object.entries(candidates)
    .map((x) => ({
      name: x[0],
      votes: x[1],
    }))
    .sort((a, b) => b.votes - a.votes)

  return (
    <div>
      <div
        className="navbar mb-2 shadow-lg bg-neutral text-neutral-content
    flex justify-between items-center text-lg"
      >
        <div>
          <div className="w-12 h-12 mr-2">
            <NearLogo />
          </div>
          Hi,&nbsp;
          <span className="font-bold">{window.accountId}</span>!
        </div>
        <div className="">
          <button className="btn btn-link text-white ml-2" onClick={logout}>
            Logout
          </button>
        </div>
      </div>



      <div className="flex flex-col justify-center items-center">
        <div className="w-full max-w-2xl">

          <img className="nft" src={IMAGE_LINK} />

          <div className="mb-4 w-full">
            <p className="mb-5 text-2xl">

              Please add Passenger to check-in:
            </p>

            <AddCandidate onClick={addCandidate} />
          </div>


            <p className="mb-5 text-2xl">

              Checked-in passengers list:
            </p>

          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-center">Seq</th>
                <th className="text-center">PAX</th>
                <th className="text-center">Seat</th>
                <th className="w-48"></th>
              </tr>
            </thead>
            <tbody>
              {candidatesList.map((x, idx) => (
                <tr key={x.name}>
                  <th>{idx + 1}</th>
                  <td className="text-center">{x.name}</td>
                  <td className="text-center">{x.votes}</td>
                  <td className="flex justify-center w-48">
                    <LoadingButton onClick={() => vote(x.name)}>
                      MINT NFT Boarding Pass
                    </LoadingButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>


          <div className="after">
            <br />
            <p>Please find your NFT boarding pass in your <a target="_blank" rel="noreferrer" href="https://wallet.testnet.near.org/?tab=collectibles"><b>wallet</b></a></p>
          </div>

        </div>
      </div>
    </div>
  )
}

const Alert: React.FC<AlertComponentPropsWithStyle> = ({
  style,
  message,
  close,
}) => {
  return (
    <div className="alert alert-error justify-start" style={style}>
      <BanIcon className="w-6 mr-2" />
      <label>{message}</label>
    </div>
  )
}

const App: React.FC = () => {
  const options = {
    position: positions.BOTTOM_CENTER,
    timeout: 4000,
    transition: transitions.SCALE,
  }

  return (
    <AlertProvider template={Alert} {...options}>
      <Suspense fallback="Loading...">
        {!window.walletConnection.isSignedIn() ? <Login /> : <Main />}
      </Suspense>
    </AlertProvider>
  )
}

export default App
