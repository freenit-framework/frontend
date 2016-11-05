import React from 'react';
import { connect } from 'react-redux';
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';


const mapStateToProps = (state) => ({
  theme: state.theme.theme,
});


function SidebarTransitionGroup(props) {
  return (
    <VelocityTransitionGroup
      component="div"
      style={{
        overflow: 'hidden',
      }}
      enter={{
        animation: 'slideDown',
        duration: 300,
        style: { height: '' },
      }}
      leave={{
        animation: 'slideUp',
        duration: 300,
      }}
    >
      <div>
        {props.children}
      </div>
    </VelocityTransitionGroup>
  );
}


SidebarTransitionGroup.propTypes = {
  theme: React.PropTypes.object,
  children: React.PropTypes.node,
};


export default connect(mapStateToProps)(SidebarTransitionGroup);
