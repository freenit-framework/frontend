import React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import TestApp from 'TestApp'
// import { data } from 'store/provider'


it('dashboard', async () => {
  let wrapper
  await act(async () => {
    wrapper = await mount(
      <TestApp path="/dashboard" />
    )
  })
  let h5 = wrapper.find('h5[data-id="roles"]')
  expect(h5.text()).toEqual('Roles')

  h5 = wrapper.find('h5[data-id="users"]')
  expect(h5.text()).toEqual('Users')
})
