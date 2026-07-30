<script lang="ts">
  import { untrack } from "svelte";
  import { sineInOut } from "svelte/easing";
  import { fade } from "svelte/transition";
  import type { QEvent } from "$utils";
  import { to12Hour } from "./time";
  import type QTimeState from "./timeState.svelte";

  type QTimeDialPointerEvent = QEvent<PointerEvent, HTMLDivElement>;
  type QTimeDialButtonEvent = QEvent<KeyboardEvent, HTMLButtonElement>;
  type QTimePart = "hour" | "minute";

  interface QTimeDialOption {
    part: QTimePart;
    value: number;
    label: string;
    spokenValue: number;
    angle: number;
    radius: 4.3125 | 6.3125;
    selected: boolean;
    roving: boolean;
  }

  const fullTurn = Math.PI * 2;
  const outerRadius = 6.3125;
  const innerRadius = 4.3125;
  const ringThresholdRatio = (outerRadius + innerRadius) / 2 / 16;
  const dragThreshold = 8;
  const handMotionDuration = 500;

  let { state: picker }: { state: QTimeState } = $props();

  let pointerId = $state<number>();
  let pointerPart: QTimePart = "hour";
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerDragged = false;
  let visualAngle = $state(
    untrack(() =>
      picker.activePart === "hour" ? (picker.draftTime.hour % 12) * 30 : picker.draftTime.minute * 6
    )
  );

  const options = $derived.by(() => {
    const part = picker.activePart;
    const partOptions =
      part === "hour"
        ? getHourOptions(picker.draftTime.hour, picker.format24h)
        : getMinuteOptions(picker.draftTime.minute);

    return partOptions.map((option) => ({ ...option, part }));
  });
  const normalizedHandAngle = $derived(
    picker.activePart === "hour" ? (picker.draftTime.hour % 12) * 30 : picker.draftTime.minute * 6
  );
  const handLength = $derived(
    picker.activePart === "hour" && picker.format24h && picker.draftTime.hour >= 12
      ? innerRadius
      : outerRadius
  );
  const motionDuration = $derived(
    pointerId === undefined ? picker.pickerMotionDuration(handMotionDuration) : 0
  );

  $effect(() => {
    const target = normalizedHandAngle;

    untrack(() => {
      const current = ((visualAngle % 360) + 360) % 360;
      visualAngle += ((target - current + 540) % 360) - 180;
    });
  });

  function getHourOptions(hour: number, format24h: boolean): Omit<QTimeDialOption, "part">[] {
    if (format24h) {
      return Array.from({ length: 24 }, (_, value) => {
        const index = value % 12;
        return {
          value,
          label: value === 0 ? "00" : String(value),
          spokenValue: value,
          angle: index * 30,
          radius: value >= 12 ? innerRadius : outerRadius,
          selected: value === hour,
          roving: value === hour,
        };
      });
    }

    const periodOffset = hour >= 12 ? 12 : 0;
    const selectedHour = to12Hour(hour).hour;

    return Array.from({ length: 12 }, (_, index) => {
      const displayHour = index || 12;
      return {
        value: (displayHour % 12) + periodOffset,
        label: String(displayHour),
        spokenValue: displayHour,
        angle: index * 30,
        radius: outerRadius,
        selected: displayHour === selectedHour,
        roving: displayHour === selectedHour,
      };
    });
  }

  function getMinuteOptions(minute: number): Omit<QTimeDialOption, "part">[] {
    const rovingMinute = (Math.round(minute / 5) * 5) % 60;

    return Array.from({ length: 12 }, (_, index) => {
      const value = index * 5;
      return {
        value,
        label: String(value).padStart(2, "0"),
        spokenValue: value,
        angle: value * 6,
        radius: outerRadius,
        selected: value === minute,
        roving: value === rovingMinute,
      };
    });
  }

  function optionLabel(option: QTimeDialOption) {
    return option.part === "hour"
      ? `${picker.resolvedLabels.hour} ${option.spokenValue} ${picker.resolvedLabels.of} ${picker.format24h ? 24 : 12}`
      : `${picker.resolvedLabels.minute} ${option.spokenValue} ${picker.resolvedLabels.of} 60`;
  }

  function selectOption(option: QTimeDialOption, complete: boolean) {
    if (picker.activePart === "hour") {
      picker.selectHour(option.value, false);
    } else {
      picker.selectMinute(option.value, complete);
    }
  }

  function handleOptionClick(event: MouseEvent, option: QTimeDialOption) {
    if (event.detail === 0) {
      selectOption(option, true);
    }
  }

  function handleOptionKeydown(event: QTimeDialButtonEvent, optionIndex: number) {
    const offset =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;

    if (!offset) {
      return;
    }

    event.preventDefault();
    const targetIndex = (optionIndex + offset + options.length) % options.length;
    const target = options[targetIndex];

    selectOption(target, false);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>(`.q-time__dial-option[data-${picker.activePart}]`)
      .item(targetIndex)
      ?.focus();
  }

  function handlePointerdown(event: QTimeDialPointerEvent) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    pointerId = event.pointerId;
    pointerPart = picker.activePart;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    pointerDragged = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    selectAtPointer(event, pointerPart, false, false);
  }

  function handlePointermove(event: QTimeDialPointerEvent) {
    if (event.pointerId !== pointerId) {
      return;
    }

    if (
      !pointerDragged &&
      Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY) >= dragThreshold
    ) {
      pointerDragged = true;
    }

    event.preventDefault();

    selectAtPointer(event, pointerPart, pointerDragged, false);
  }

  function handlePointerup(event: QTimeDialPointerEvent) {
    if (event.pointerId !== pointerId) {
      return;
    }

    selectAtPointer(event, pointerPart, pointerDragged, true);
    pointerId = undefined;
  }

  function handlePointercancel(event: PointerEvent) {
    if (event.pointerId === pointerId) {
      pointerId = undefined;
    }
  }

  function selectAtPointer(
    event: QTimeDialPointerEvent,
    part: QTimePart,
    preciseMinute: boolean,
    complete: boolean
  ) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    const turn = (Math.atan2(x, -y) + fullTurn) % fullTurn;

    if (part === "hour") {
      const hour = Math.round((turn / fullTurn) * 12) % 12;

      if (picker.format24h) {
        const distance = Math.hypot(x, y);
        picker.selectHour(hour + (distance < rect.width * ringThresholdRatio ? 12 : 0), complete);
      } else {
        const periodOffset = picker.draftTime.hour >= 12 ? 12 : 0;
        picker.selectHour(hour + periodOffset, complete);
      }
      return;
    }

    const divisions = preciseMinute ? 60 : 12;
    const division = Math.round((turn / fullTurn) * divisions) % divisions;
    picker.selectMinute(preciseMinute ? division : division * 5, complete);
  }

  // eslint-disable-next-line no-unassigned-vars -- Q.classes injects this inside the keyed loop.
  let option!: QTimeDialOption;

  Q.classes("q-time__dial-option", {
    bemClasses: {
      // A precise minute hand can overlap the nearest five-minute label without selecting it.
      selected: option.selected || (option.part === "minute" && option.roving),
    },
  });
</script>

<div
  class="q-time__dial"
  role="group"
  aria-label={picker.activePart === "hour"
    ? picker.resolvedLabels.selectHour
    : picker.resolvedLabels.selectMinute}
  style={`--motion-duration: ${motionDuration}ms;`}
  onpointerdown={handlePointerdown}
  onpointermove={handlePointermove}
  onpointerup={handlePointerup}
  onpointercancel={handlePointercancel}
  onlostpointercapture={handlePointercancel}
>
  <span
    class="q-time__track"
    aria-hidden="true"
    style={`--angle: ${visualAngle}deg; --hand-length: ${handLength}rem;`}
  ></span>
  <span
    class="q-time__hand"
    aria-hidden="true"
    style={`--angle: ${visualAngle}deg; --hand-length: ${handLength}rem;`}
  ></span>
  <span class="q-time__center" aria-hidden="true"></span>

  {#each options as option, optionIndex (`${option.part}-${optionIndex}`)}
    <button
      class="q-time__dial-option"
      type="button"
      aria-label={optionLabel(option)}
      aria-pressed={option.selected}
      aria-hidden={option.part !== picker.activePart || undefined}
      inert={option.part !== picker.activePart}
      tabindex={option.part === picker.activePart && option.roving ? 0 : -1}
      data-hour={option.part === "hour" ? option.value : undefined}
      data-minute={option.part === "minute" ? option.value : undefined}
      style={`--angle: ${option.angle}deg; --radius: ${option.radius}rem;`}
      in:fade={{
        duration: picker.pickerMotionDuration(handMotionDuration),
        easing: sineInOut,
      }}
      out:fade={{
        duration: picker.pickerMotionDuration(handMotionDuration),
        easing: sineInOut,
      }}
      onclick={(event) => handleOptionClick(event, option)}
      onkeydown={(event) => handleOptionKeydown(event, optionIndex)}
    >
      {option.label}
    </button>
  {/each}
</div>
