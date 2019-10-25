import React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import TestApp from 'TestApp'
// import { data } from 'store/provider'


it('login', async () => {
  let wrapper
  await act(async () => {
    wrapper = await mount(
      <TestApp path="/login" />
    )
  })
  let title = wrapper.find('h1')
  expect(title.text()).toEqual('Login')
})
