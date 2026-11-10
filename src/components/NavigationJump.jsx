export default function NavigationJump({ onClick }) {
  return (
    <button type="button" className="navigation-jump" onClick={onClick}>
      Navigate
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4v16m-6-6 6 6 6-6" />
      </svg>
    </button>
  )
}
