import logo from '../logo.png';

export default function SplashScreen({ onStart }) {
  return (
    <div className="screen splash">
      <div className="sp-bg" />
      <div className="sp-center">
        <img src={logo} alt="logo" width="400" height="400"
          style={{ objectFit:"contain" }} />
        <button className="splash-btn" onClick={onStart}>Magsimula →</button>
      </div>
    </div>
  );
}
