<template>
  <div class="relative font-light tracking-tight text-black text-xl">
    <div ref="elMatter" class="absolute top-0 left-0 w-full h-full" />

    <div class="min-h-[100dvh] relative grid grid-cols-2 gap-5 p-10 pointer-events-none">
      <div class="flex items-center justify-center">
        <div ref="elRock" class="rock with-caption" />
      </div>

      <div class="w-full flex flex-col justify-center">
        <div v-for="(paragraph, indexP) in texts" :key="indexP" class="mb-5 max-w-2xl ml-auto">
          <span
            v-for="(text, indexT) in paragraph"
            :key="indexT"
            ref="elsTextBoxes"
            class="inline-block mr-2 pointer-events-auto"
          >
            {{ text }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Matter from 'matter-js'
import gsap from 'gsap'

function debounce (callback, time) {
  let timeout

  return () => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
      timeout = null
      callback()
    }, time)
  }
}

export default {
  setup () {
    const elMatter = ref(null)
    const elRock = ref(null)
    const elsTextBoxes = ref([])
    const texts = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu elit arcu. Aliquam non volutpat elit, id commodo felis. In hac habitasse platea dictumst. Cras vulputate, dui sit amet mollis sodales, est nunc posuere nunc, ac porta augue massa et massa. Phasellus sit amet sem vel ipsum consectetur congue non eget lectus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pellentesque dapibus enim et tincidunt pretium. Aliquam erat volutpat. In faucibus elit id nisi auctor, vel luctus metus placerat. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras vitae facilisis leo. Suspendisse id scelerisque ligula, a ultrices mauris.'.split(' '),
      'Nunc sed malesuada diam, vel laoreet lectus. Donec eget enim tellus. Integer pharetra aliquam ipsum. In hac habitasse platea dictumst. Nam ipsum est, mollis non sodales in, gravida at leo. In in est a ante egestas suscipit quis id lectus. Aliquam erat volutpat. Nullam elementum purus nec dolor feugiat lacinia nec et nulla. Aliquam tristique vestibulum ex, vitae malesuada tortor. In fermentum tellus nec metus varius finibus nec non nunc. Cras nec leo ut ipsum vulputate bibendum at ut dolor. Cras nec efficitur purus. Nullam hendrerit dictum risus, id rutrum nibh egestas in. Suspendisse potenti.'.split(' '),
    ]

    const bodies = []

    let rock = null

    onMounted(() => {
      const quickXSetters = elsTextBoxes.value.map((el) => {
        return gsap.quickSetter(el, 'x', 'px')
      })

      const quickYSetters = elsTextBoxes.value.map((el) => {
        return gsap.quickSetter(el, 'y', 'px')
      })

      const quickRotationSetters = elsTextBoxes.value.map((el) => {
        return gsap.quickSetter(el, 'rotation', 'rad')
      })

      const rockQuickXSetter = gsap.quickSetter(elRock.value, 'x', 'px')
      const rockQuickYSetter = gsap.quickSetter(elRock.value, 'y', 'px')

      const getRockCoords = () => {
        const { x, y, width, height } = elRock.value.getBoundingClientRect()
        return { x: x + width / 2, y: y + height / 2 }
      }

      const setupScene = function () {
        const { Engine, Render, Runner, Events, Constraint, MouseConstraint, Mouse, Composite, Bodies, Query } = Matter

        const maxY = elMatter.value.clientHeight
        const maxX = elMatter.value.clientWidth

        const { x: rockX, y: rockY } = getRockCoords()

        const engine = Engine.create()
        const world = engine.world

        const render = Render.create({
          element: elMatter.value,
          engine,
          options: {
            width: maxX,
            height: maxY,
            background: 'transparent',
            wireframeBackground: 'transparent',
            hasBounds: true,
            enabled: true,
            showAxes: false,
          },
        })

        Render.run(render)

        const runner = Runner.create()
        Runner.run(runner, engine)

        const edgeParams = { isStatic: true, restitution: 0.4, friction: 0.3, render: { visible: false } }

        const ground = Bodies.rectangle(maxX / 2, maxY + 50, maxX + 200, 100, edgeParams)
        const ceiling = Bodies.rectangle(maxX / 2, -50, maxX + 200, 100, edgeParams)
        const wallRight = Bodies.rectangle(maxX + 50, maxY / 2, 100, maxY, edgeParams)
        const wallLeft = Bodies.rectangle(-50, maxY / 2, 100, maxY, edgeParams)
        const edges = [ground, ceiling, wallRight, wallLeft]

        const rockOptions = { density: 0.01, frictionAir: 0.02, render: { visible: false } }
        rock = Bodies.polygon(rockX, rockY, 7, 20, rockOptions)

        const elastic = Constraint.create({
          pointA: { x: rockX, y: rockY },
          bodyB: rock,
          length: 0.02,
          damping: 0.01,
          stiffness: 0.05,
          render: { strokeStyle: '#000000', lineWidth: 0.7 },
        })

        elsTextBoxes.value.forEach((el, index) => {
          const { left, top, width, height } = el.getBoundingClientRect()
          const body = Bodies.rectangle(left + (width / 2), top + (height / 2), width, height, {
            frictionAir: 0.05,
            restitution: 1,
            render: { visible: false },
          })
          el.id = body.id
          bodies.push(body)
          Composite.add(engine.world, body)
        })

        Composite.add(engine.world, [...edges, rock, elastic])

        Events.on(engine, 'afterUpdate', function () {
          let hasMoved = false

          if (!hasMoved && mouseConstraint.mouse.button === -1 && rock.position.x < rockX - 10) {
            elRock.value.classList.remove('with-caption')
            hasMoved = true
            elastic.bodyB = null
            Composite.remove(engine.world, elastic)
          }
        })

        Events.on(engine, 'collisionStart', ({ pairs }) => {
          for (const { bodyA, bodyB } of pairs) {
            if (bodyA === rock || bodyB === rock) {
              document.body.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 90%)`
            } else if (edges.includes(bodyA) || edges.includes(bodyB)) {
              let textBoxId = null
              if (edges.includes(bodyA)) {
                textBoxId = bodyB.id
                Composite.remove(engine.world, bodyB)
              } else {
                textBoxId = bodyA.id
                Composite.remove(engine.world, bodyA)
              }

              const textBox = document.getElementById(textBoxId)
              gsap.to(textBox, { duration: 0.3, opacity: 0, ease: 'none', onComplete: () => textBox.remove() })
            }
          }
        })

        const mouse = Mouse.create(render.canvas)
        const mouseConstraint = MouseConstraint.create(engine, {
          mouse,
          constraint: {
            stiffness: 0.1,
            render: { visible: false },
          },
        })

        Events.on(mouseConstraint, 'mousemove', (event) => {
          const isTouchingRock = Query.point([rock], event.mouse.position).length > 0
          const mouseDown = mouseConstraint.mouse.button === 0

          if (!mouseDown && !isTouchingRock) {
            render.canvas.style.cursor = 'default'
          } else if (isTouchingRock) {
            render.canvas.style.cursor = mouseDown ? 'grabbing' : 'grab'
          }
        })

        Composite.add(world, mouseConstraint)

        render.mouse = mouse

        Render.lookAt(render, { min: { x: 0, y: 0 }, max: { x: maxX, y: maxY } })

        engine.world.gravity.y = 0
      }

      setupScene()

      const update = () => {
        for (let i = 0, l = elsTextBoxes.value.length; i < l; i++) {
          const bodyDom = elsTextBoxes.value[i]
          let body = null

          for (let j = 0, k = bodies.length; j < k; j++) {
            if (bodies[j].id === +bodyDom.id) {
              body = bodies[j]
              break
            }
          }

          if (body === null) { continue }

          const { x, y } = body.position
          const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = bodyDom

          const xSetter = quickXSetters[i]
          const ySetter = quickYSetters[i]
          const rotationSetter = quickRotationSetters[i]

          xSetter(x - offsetLeft - offsetWidth / 2)
          ySetter(y - offsetTop - offsetHeight / 2)
          rotationSetter(body.angle)
        }

        const setRockPosition = () => {
          const { offsetWidth, offsetLeft, offsetHeight, offsetTop } = elRock.value
          const { x, y } = rock.position
          rockQuickXSetter(x - offsetLeft - offsetWidth / 2)
          rockQuickYSetter(y - offsetTop - offsetHeight / 2)
        }

        setRockPosition()

        window.requestAnimationFrame(update)
      }

      update()

      window.addEventListener('resize', debounce(() => {
        location.reload()
      }, 500))
    })

    return { elMatter, elsTextBoxes, elRock, texts }
  },

}
</script>

<style lang="scss">
.rock {
  @apply rounded-full h-10 w-10 bg-current cursor-pointer relative;

  &.with-caption {

    &::before,
    &::after {
      content: 'Pull ←';
      @apply absolute top-1/2 -translate-y-1/2 right-[calc(100%+0.25rem)];
      @apply whitespace-nowrap text-xs uppercase font-medium tracking-wide animate-pulse;
    }

  }
}
</style>
