async function handleGradeCommand(bs, getUserId, user, ou) {
    try {
        if (user && ou) {
            let userId = await getUserId(user);
            if (userId) {
                let courseResponse = await bs.get(`/d2l/api/lp/(version)/courses/${ou}`);
                let courseName = courseResponse.Name || `Course ${ou}`;
                let courseLink = `<<a href="/d2l/home/${ou}">>${courseName}<</a>>`;

                let response = await bs.get(`/d2l/api/le/(version)/${ou}/grades/final/values/${userId}`);
                if (response && response.DisplayedGrade) {
                    return `Final grade for ${courseLink}: ${response.DisplayedGrade}`;
                } else {
                    return `Error: No final grade found for ${courseLink}`;
                }
            } else {
                return 'Error: User not found';
            }
        } else {
            return "Usage: grade -u <username|email|banner-id> -o <org-unit-id>";
        }
    } catch (error) {
        console.error('Error in handleGradeCommand:', error);
        return 'Error: An issue occurred while fetching the grade';
    }
}

async function handleGradesCommand(bs, getUserId, user) {
    try {
        if (user) {
            let userId = await getUserId(user);
            if (userId) {
                let enrolments = await bs.get(`/d2l/api/lp/(version)/enrollments/users/${userId}/orgUnits/`);
                if (enrolments && enrolments.Items) {
                    let m = '';
                    for (let enrolment of enrolments.Items) {
                        if (enrolment.OrgUnit.Type.Id == 3) { // Ensure it is a course
                            let courseResponse = await bs.get(`/d2l/api/lp/(version)/courses/${enrolment.OrgUnit.Id}`);
                            let courseName = courseResponse.Name || `Course ${enrolment.OrgUnit.Id}`;
                            let courseLink = `<<a href="/d2l/home/${enrolment.OrgUnit.Id}">>${courseName}<</a>>`;

                            let grades = await bs.get(`/d2l/api/le/(version)/${enrolment.OrgUnit.Id}/grades/final/values/${userId}`);
                            if (grades && grades.DisplayedGrade) {
                                m += `Grades for ${courseLink}: ${grades.DisplayedGrade}\n`;
                            } else {
                                m += `No grades found for ${courseLink}\n`;
                            }
                        }
                    }
                    return m;
                } else {
                    return 'Error: No enrollments found for the user';
                }
            } else {
                return 'Error: User not found';
            }
        } else {
            return "Usage: grades -u <username|email|banner-id>";
        }
    } catch (error) {
        console.error('Error in handleGradesCommand:', error);
        return 'Error: An issue occurred while fetching the grades';
    }
}
