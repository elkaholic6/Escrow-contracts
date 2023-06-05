export default function Escrow({
  initiatedEscrows,
  handleApprove,
}) {
  return (
    <div className="existing-contract">
      <ul className="fields">
      <li>
          <div> Contract Address </div>
          <div> {initiatedEscrows} </div>
        </li>
        <div
          className="button"
          id={initiatedEscrows[0]}
          onClick={(e) => {
            e.preventDefault();

            handleApprove();
          }}
        >
          Approve
        </div>
      </ul>
    </div>
  );
}
