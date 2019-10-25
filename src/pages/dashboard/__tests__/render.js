import React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import TestApp, { history } from 'TestApp'
// import { data } from 'store/provider'


it('dashboard page', async () => {
  let wrapper
  await act(async () => {
    wrapper = await mount(
      <TestApp path="/" />
    )
  })
  const title = wrapper.find('a[data-id="app"]')
  expect(title.text()).toEqual('Startkit')
})

it('login page', async () => {
  let wrapper
  await act(async () => {
    wrapper = await mount(
      <TestApp path="/login" />
    )
  })
  history.push('/login')
  const title = wrapper.find('h1')
  expect(title.text()).toEqual('Login')
})
