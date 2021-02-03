import { computed, ref, watch} from "vue";
import { useDateTime } from "./useDateTime"

const { formatDurationFromMs } = useDateTime()

export function useTracker(taskRef, currentTimerRef) {
    const task = taskRef || ref(null)
    const currentTimer = currentTimerRef || ref({})
    
    const savedTime = computed(() => {
        if (task.value.tracks) {
          const time = task.value.tracks.reduce((milliseconds, task)=> {
            return milliseconds + Number(task.duration_ms || 0);
          }, 0)
          
          return time;
        } 
        return 0 
    })
      
    const activeTimer = ref(0);
      
    const getActiveTimer = () => {
        const duration = currentTimer && currentTimer.value && currentTimer.value.currentTime
        if (duration) {
        return duration.as("milliseconds");
        }
        return 0;
    }
      
    watch(() => currentTimer.value.currentTime, () => {
        activeTimer.value = getActiveTimer()
    }, { immediate: true })
    
    const timeTracked = computed(() => {
        return formatDurationFromMs(savedTime.value + activeTimer.value).toFormat("hh:mm:ss");
    })

    return {
        timeTracked
    }
}
