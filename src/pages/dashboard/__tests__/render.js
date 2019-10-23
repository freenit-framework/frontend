import React from 'react'
import { mount } from 'enzyme'
import TestComponent from 'mock'
import Dashboard from '..'


it('dashboard page', () => {
  const wrapper = mount(
    <TestComponent
      path="/dashboard"
      component={Dashboard}
    />
  )
})
