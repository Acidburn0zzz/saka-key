import { h } from 'preact';
import { connect } from 'preact-redux';
import { renameProfile } from 'pages/options/actions';

const Input = ({ activeProfile, profiles, tryRenameProfile, setIsEditingName }) => (
  <div className='mdc-textfield' style='margin-bottom: 0px' data-demo-no-auto-js=''>
    <input
      ref={(el) => setTimeout(() => el && el.select(), 100)}
      className='mdc-textfield__input mode-card-select'
      value={activeProfile}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
          setIsEditingName(false);
        }
      }}
      onBlur={(e) => tryRenameProfile(e.target.value)}
    />
  </div>
);

const mapDispatchToProps = (dispatch, { category, activeProfile, profiles, setIsEditingName }) => ({
  tryRenameProfile: (newName) => {
    if (newName !== '' && profiles.indexOf(newName) === -1) {
      dispatch(renameProfile(category, activeProfile, newName));
    }
    setIsEditingName(false);
  }
});

export default connect(null, mapDispatchToProps)(Input);
